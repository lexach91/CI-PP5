from datetime import datetime
import json
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import stripe
from django.conf import settings
from authentication.authentication import JWTAuthentication
from subscriptions.models import SubscriptionPlan, Membership

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
        else:
            # create checkout session
            try:
                session = stripe.checkout.Session.create(
                    payment_method_types=['card'],
                    subscription_data={
                        'items': [{
                            'plan': plan.stripe_plan_id,
                        }],
                    },
                    success_url=base_url + '/checkout?success=true&session_id={CHECKOUT_SESSION_ID}',
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
    def post(self, request):
        webhook_secret = settings.STRIPE_WEBHOOK_KEY
        # request_data = json.loads(request.data)
        
        if webhook_secret:
            signature = request.headers.get('stripe-signature')
            try:
                event = stripe.Webhook.construct_event(
                    payload=json.dumps(request.data), sig_header=signature, secret=webhook_secret)
                data = event['data']
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            event_type = event['type']
            
        else:
            data = request.data
            event_type = data['type']
            
        data_object = data['object']
        
        print('event type: ' + event_type)
        
        return Response({'received': 'ok'}, status=status.HTTP_200_OK)