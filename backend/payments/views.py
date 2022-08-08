from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import stripe
from django.conf import settings
from authentication.authentication import JWTAuthentication

stripe.api_key = settings.STRIPE_SECRET_KEY


class TestPaymentAPIView(APIView):
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        user = request.user
        if user is None:
            return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
        
        test_payment_intent = stripe.PaymentIntent.create(
            amount=1234,
            currency='usd',
            payment_method_types=['card'],
            receipt_email=user.email,
        )
        
        print(test_payment_intent)            
        return Response({'success': 'Test payment intent created'}, status=status.HTTP_200_OK)
    
class TestSubscriptionAPIView(APIView):
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        user = request.user
        if user is None:
            return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
        
        test_customer = stripe.Customer.create(
            email=user.email,
            source="tok_visa",
        )
        
        test_plan = stripe.Plan.create(
            amount=1234,
            currency='usd',
            interval='month',
            product={
                'name': 'Test plan',
            },
            usage_type='licensed',
        )
        
        test_subscription = stripe.Subscription.create(
            customer=test_customer.id,
            items=[{'plan': test_plan.id}],
        )
        
        print(test_subscription)            
        return Response({'success': 'Test subscription created'}, status=status.HTTP_200_OK)