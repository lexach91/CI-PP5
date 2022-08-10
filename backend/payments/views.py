from datetime import datetime, timedelta
# import datetime
import json
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import stripe
from django.conf import settings
from authentication.authentication import JWTAuthentication
from subscriptions.models import SubscriptionPlan, Membership
from profiles.models import User
from .models import Payment, PaymentHistory

stripe.api_key = settings.STRIPE_SECRET_KEY
# set up webhook key
# stripe.webhook_secret = settings.STRIPE_WEBHOOK_KEY
base_url = settings.BASE_URL


class CreateCheckoutSessionView(APIView):
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        user = request.user
        if user is None:
            return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
        new_data = request.data
        plan = SubscriptionPlan.objects.get(id=new_data.get('plan_id'))
        if plan is None:
            return Response({'error': 'Plan not found'}, status=status.HTTP_404_NOT_FOUND)
        if plan.price == 0:
            return Response({'error': 'Free plan'}, status=status.HTTP_400_BAD_REQUEST)
        user_membership = Membership.objects.get(user=user)
        if user_membership is not None and user_membership.type.name != 'Free' and (user_membership.expires_at - datetime.now()).days > 0:
            return Response({'error': 'You already have a membership'}, status=status.HTTP_400_BAD_REQUEST)                
        # create checkout session
        customer = stripe.Customer.list(email=user.email)
        print(customer)
        if len(customer.data) == 0:
            customer = stripe.Customer.create(email=user.email)
        else:
            customer = customer.data[0]
        try:
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                subscription_data={
                    'items': [{
                        'plan': plan.stripe_plan_id,
                    }],
                },
                customer=customer.id,
                # customer_email=user.email,
                success_url=base_url +
                '/checkout?success=true&session_id={CHECKOUT_SESSION_ID}',
                cancel_url=base_url + '/checkout?cancelled=true',
            )
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response({'sessionId': session['id']}, status=status.HTTP_200_OK)


class CheckoutSessionView(APIView):
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        user = request.user
        if user is None:
            return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
        new_data = request.data
        session_id = new_data.get('session_id')
        if session_id is None:
            return Response({'error': 'Session id not found'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            session = stripe.checkout.Session.retrieve(session_id)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response({'session': session}, status=status.HTTP_200_OK)


class StripeWebhookListener(APIView):
    # @csrf_exempt
    def post(self, request):
        webhook_secret = settings.STRIPE_WEBHOOK_KEY
        payload = request.body
        event = None

        try:
            event = stripe.Event.construct_from(
                json.loads(payload), webhook_secret)
            # data = event['data']
            # print(data, 'data')
        except Exception as e:
            print(e, 'error')
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


        # Handle the event        
        if event.type == 'customer.subscription.created':
            subscription = event.data.object
            customer_id = subscription.customer
            customer = stripe.Customer.retrieve(customer_id)
            user = User.objects.get(email=customer.email)
            plan = SubscriptionPlan.objects.get(stripe_plan_id=subscription["items"]["data"][0]["plan"]["id"])
            membership = Membership.objects.get_or_create(user=user)[0]
            membership.type = plan
            membership.expires_at = datetime.now() + timedelta(days=31 if datetime.now().month%2 == 0 else 30)
            membership.stripe_id = subscription.id
            membership.save()
            payment_history = PaymentHistory.objects.get_or_create(user=user)[0]
            payment = Payment.objects.create(membership=membership, amount=plan.price)
            payment_history.payments.add(payment)
            payment_history.save()
        if event.type == 'customer.subscription.updated':
            subscription = event.data.object
            customer_id = subscription.customer
            customer = stripe.Customer.retrieve(customer_id)
            user = User.objects.get(email=customer.email)
            plan = SubscriptionPlan.objects.get(stripe_plan_id=subscription["items"]["data"][0]["plan"]["id"])
            membership = Membership.objects.get(user=user)
            membership.type = plan
            membership.expires_at = datetime.now() + timedelta(days=31)
            membership.stripe_id = subscription.id
            membership.save()
            payment_history = PaymentHistory.objects.get_or_create(user=user)[0]
            payment = Payment.objects.create(membership=membership, amount=plan.price)
            payment_history.payments.add(payment)
            payment_history.save()
        if event.type == 'customer.subscription.deleted':
            subscription = event.data.object
            customer_id = subscription.customer
            customer = stripe.Customer.retrieve(customer_id)
            user = User.objects.get(email=customer.email)
            membership = Membership.objects.get(user=user)
            free_plan = SubscriptionPlan.objects.get(name='Free')
            membership.type = free_plan
            membership.expires_at = None
            membership.stripe_id = None
            membership.save()
            
        return Response({'received': True}, status=status.HTTP_200_OK)