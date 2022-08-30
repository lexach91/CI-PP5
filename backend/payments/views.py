from datetime import datetime, timedelta
from django.utils.timezone import localtime
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
from .serializers import PaymentHistorySerializer
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags

stripe.api_key = settings.STRIPE_SECRET_KEY
base_url = settings.BASE_URL


class CreateCheckoutSessionView(APIView):
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        user = request.user
        if user is None:
            return Response(
                {"error": "You are not logged in"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        new_data = request.data
        plan = SubscriptionPlan.objects.get(id=new_data.get("plan_id"))
        if plan is None:
            return Response(
                {"error": "Plan not found"}, status=status.HTTP_404_NOT_FOUND
            )
        if plan.price == 0:
            return Response(
                {"error": "Free plan"}, status=status.HTTP_400_BAD_REQUEST
            )
        user_membership = Membership.objects.get_or_create(user=user)[0]
        if (
            user_membership is not None and
            user_membership.type.name != "Free" and
            (user_membership.expires_at - localtime()).days > 0
        ):
            return Response(
                {"error": "You already have a membership"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        # create checkout session
        customer = stripe.Customer.list(email=user.email)
        print(customer)
        if len(customer.data) == 0:
            customer = stripe.Customer.create(email=user.email)
        else:
            customer = customer.data[0]
        try:
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                subscription_data={
                    "items": [
                        {
                            "plan": plan.stripe_plan_id,
                        }
                    ],
                },
                customer=customer.id,
                success_url=base_url +
                "/checkout?success=true&session_id={CHECKOUT_SESSION_ID}",
                cancel_url=base_url + "/checkout?cancelled=true",
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        return Response(
            {"sessionId": session["id"]}, status=status.HTTP_200_OK
        )


class CheckoutSessionView(APIView):
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        user = request.user
        if user is None:
            return Response(
                {"error": "You are not logged in"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        new_data = request.data
        session_id = new_data.get("session_id")
        if session_id is None:
            return Response(
                {"error": "Session id not found"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            session = stripe.checkout.Session.retrieve(session_id)
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        return Response({"session": session}, status=status.HTTP_200_OK)


class GetPaymentHistoryAPIView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        user = request.user
        if user is None:
            return Response(
                {"error": "You are not logged in"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        payment_history = PaymentHistory.objects.get_or_create(user=user)[0]
        serializer = PaymentHistorySerializer(payment_history)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CreateCustomerPortalSession(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        user = request.user
        if user is None:
            return Response(
                {"error": "You are not logged in"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        customer = stripe.Customer.list(email=user.email)
        if len(customer.data) == 0:
            return Response(
                {"error": "You are not a customer"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        customer = customer.data[0]
        session = stripe.billing_portal.Session.create(
            customer=customer.id,
            return_url=base_url + "/subscription",
        )
        return Response(
            {"sessionUrl": session["url"]}, status=status.HTTP_200_OK
        )


class CancelSubscriptionAPIView(APIView):
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        user = request.user
        if user is None:
            return Response(
                {"error": "You are not logged in"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        customer = stripe.Customer.list(email=user.email)
        if len(customer.data) == 0:
            return Response(
                {"error": "You are not a customer"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        customer = customer.data[0]
        subscription = stripe.Subscription.list(customer=customer.id)
        if len(subscription.data) == 0:
            return Response(
                {"error": "You are not subscribed"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        subscription = subscription.data[0]
        # need to calculate the remaining days and refund the remaining amount
        today = datetime.now()
        subscription_end_epoch = subscription["current_period_end"]
        subscription_end = datetime.fromtimestamp(subscription_end_epoch)
        days_remaining = (subscription_end - today).days
        plan_price = SubscriptionPlan.objects.get(
            stripe_plan_id=subscription["items"]["data"][0]["plan"]["id"]
        ).price
        refund_amount = int(plan_price / 30 * days_remaining) * 100
        latest_invoice = stripe.Invoice.retrieve(
            subscription["latest_invoice"]
        )
        payment_intent = stripe.PaymentIntent.retrieve(
            latest_invoice["payment_intent"]
        )
        if payment_intent["status"] == "succeeded" and refund_amount > 0:
            stripe.Refund.create(
                payment_intent=payment_intent["id"], amount=refund_amount
            )

        stripe.Subscription.delete(
            subscription.id,
        )
        return Response(
            {"message": "Subscription cancelled"}, status=status.HTTP_200_OK
        )


class StripeWebhookListener(APIView):
    def post(self, request):
        webhook_secret = settings.STRIPE_WEBHOOK_KEY
        payload = request.body
        event = None

        try:
            event = stripe.Event.construct_from(
                json.loads(payload), webhook_secret
            )
        except Exception as e:
            print(e, "error")
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        if event.type == "customer.subscription.deleted":
            subscription = event.data.object
            customer_id = subscription.customer
            customer = stripe.Customer.retrieve(customer_id)
            user = User.objects.get(email=customer.email)
            membership = Membership.objects.get(user=user)
            cancelled_type = SubscriptionPlan.objects.get(
                stripe_plan_id=subscription["items"]["data"][0]["plan"]["id"]
            )
            free_plan = SubscriptionPlan.objects.get(name="Free")
            membership.type = free_plan
            membership.expires_at = None
            membership.stripe_id = None
            membership.save()
            subject = "Your subscription has been cancelled"
            name = f"{user.first_name} {user.last_name}"
            html_message = render_to_string(
                "payments/subscription_cancelled_email.html",
                {"name": name, "plan": cancelled_type.name},
            )
            plain_message = strip_tags(html_message)

            send_mail(
                subject=subject,
                message=plain_message,
                from_email="dr.meetings@hotmail.com",
                recipient_list=[user.email],
                html_message=html_message,
            )
        elif event.type == "invoice.paid":
            invoice = event.data.object
            customer_id = invoice.customer
            customer = stripe.Customer.retrieve(customer_id)
            user = User.objects.get(email=customer.email)
            amount = int(invoice.amount_paid / 100)
            payment_history = PaymentHistory.objects.get_or_create(user=user)[
                0
            ]
            payment = Payment.objects.create(
                membership=user.membership, amount=amount
            )
            payment_history.payments.add(payment)
            payment_history.save()
            subject = "Your payment has been received"
            name = f"{user.first_name} {user.last_name}"
            invoice_pdf_url = invoice.invoice_pdf
            html_message = render_to_string(
                "payments/payment_success_email.html",
                {"name": name, "amount": amount, "link": invoice_pdf_url},
            )
            plain_message = strip_tags(html_message)

            send_mail(
                subject=subject,
                message=plain_message,
                from_email="dr.meetings@hotmail.com",
                recipient_list=[user.email],
                html_message=html_message,
            )
            subscription = stripe.Subscription.retrieve(invoice.subscription)
            membership = Membership.objects.filter(stripe_id=subscription.id)
            if membership.exists():
                membership = membership.first()
                membership.type = SubscriptionPlan.objects.get(
                    stripe_plan_id=subscription["items"]["data"][0]["plan"][
                        "id"
                    ]
                )
                membership.expires_at = datetime.fromtimestamp(
                    subscription["current_period_end"]
                )
                membership.stripe_id = subscription.id
                membership.save()
            else:
                membership = Membership.objects.get_or_create(user=user)[0]
                membership.type = SubscriptionPlan.objects.get(
                    stripe_plan_id=subscription["items"]["data"][0]["plan"][
                        "id"
                    ]
                )
                membership.expires_at = datetime.fromtimestamp(
                    subscription["current_period_end"]
                )
                membership.stripe_id = subscription.id
                membership.save()
                subject = "Your subscription has been created"
                html_message = render_to_string(
                    "payments/subscription_created_email.html",
                    {"name": name, "plan": membership.type.name},
                )
                plain_message = strip_tags(html_message)

                send_mail(
                    subject=subject,
                    message=plain_message,
                    from_email="dr.meetings@hotmail.com",
                    recipient_list=[user.email],
                    html_message=html_message,
                )

        elif event.type == "invoice.payment_failed":
            invoice = event.data.object
            customer_id = invoice.customer
            customer = stripe.Customer.retrieve(customer_id)
            user = User.objects.get(email=customer.email)
            amount = int(invoice.amount_due / 100)
            subject = "Your payment has failed"
            name = f"{user.first_name} {user.last_name}"
            customer_portal_url = stripe.billing_portal.Session.create(
                customer=customer.id,
                return_url=base_url,
            )
            html_message = render_to_string(
                "payments/payment_failed_email.html",
                {
                    "name": name,
                    "amount": amount,
                    "link": customer_portal_url.url,
                },
            )
            plain_message = strip_tags(html_message)

            send_mail(
                subject=subject,
                message=plain_message,
                from_email="dr.meetings@hotmail.com",
                recipient_list=[user.email],
                html_message=html_message,
            )
        elif event.type == "charge.refunded":
            charge = event.data.object
            customer_id = charge.customer
            customer = stripe.Customer.retrieve(customer_id)
            user = User.objects.get(email=customer.email)
            subject = "Your payment has been refunded"
            name = f"{user.first_name} {user.last_name}"
            amount = int(charge.amount_refunded / 100)
            html_message = render_to_string(
                "payments/payment_refunded_email.html",
                {"name": name, "amount": amount},
            )
            plain_message = strip_tags(html_message)

            send_mail(
                subject=subject,
                message=plain_message,
                from_email="dr.meetings@hotmail.com",
                recipient_list=[user.email],
                html_message=html_message,
            )

        return Response({"received": True}, status=status.HTTP_200_OK)
