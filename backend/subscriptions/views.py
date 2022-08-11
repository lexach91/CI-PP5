from django.shortcuts import render
from .models import SubscriptionPlan, Membership
from .serializers import SubscriptionPlanSerializer
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from authentication.authentication import JWTAuthentication



class GetUsersSubscriptionPlanAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    def get(self, request):
        user = request.user
        if user is None:
            return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
        membership = Membership.objects.get_or_create(user=user)[0]
        plan = membership.type
        serializer = SubscriptionPlanSerializer(plan)
        return Response(serializer.data, status=status.HTTP_200_OK)
