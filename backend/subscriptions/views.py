from django.shortcuts import render
from .models import SubscriptionPlan, Membership
from .serializers import SubscriptionPlanSerializer
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from authentication.authentication import JWTAuthentication
import stripe
from django.conf import settings

stripe.api_key = settings.STRIPE_SECRET_KEY
base_url = settings.BASE_URL


class GetUsersSubscriptionPlanAPIView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        user = request.user
        if user is None:
            return Response(
                {"error": "You are not logged in"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        membership = Membership.objects.get_or_create(user=user)[0]
        plan = membership.type
        serializer = SubscriptionPlanSerializer(plan)
        return Response(serializer.data, status=status.HTTP_200_OK)


class GetMembershipInfoAPIView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        user = request.user
        if user is None:
            return Response(
                {"error": "You are not logged in"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        membership = Membership.objects.get_or_create(user=user)[0]
        stripe_id = membership.stripe_id
        stripe_subscription = stripe.Subscription.retrieve(stripe_id)
        return Response(stripe_subscription, status=status.HTTP_200_OK)
