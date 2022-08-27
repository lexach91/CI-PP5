from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import ContactUs, NewsletterSubscription


class ContactUsAPIView(APIView):
    def post(self, request):
        name = request.data.get('name')
        email = request.data.get('email')
        subject = request.data.get('subject')
        message = request.data.get('message')
        
        if not name or not email or not subject or not message:
            return Response({"error": "Please provide all the required fields"}, status=status.HTTP_400_BAD_REQUEST)

        ContactUs.objects.create(name=name, email=email, subject=subject, message=message)        

        return Response(status=status.HTTP_201_CREATED)
    

class NewsletterSubscriptionAPIView(APIView):
    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response({"error": "Please provide all the required fields"}, status=status.HTTP_400_BAD_REQUEST)
        
        if NewsletterSubscription.objects.filter(email=email).exists():
            return Response({"error": "You are already subscribed to our newsletter"}, status=status.HTTP_400_BAD_REQUEST)

        NewsletterSubscription.objects.create(email=email)        

        return Response(status=status.HTTP_201_CREATED)


class UnsubscribeNewsletterAPIView(APIView):
    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response({"error": "Please provide all the required fields"}, status=status.HTTP_400_BAD_REQUEST)
        
        if not NewsletterSubscription.objects.filter(email=email).exists():
            return Response({"error": f"{email} are not subscribed to our newsletter"}, status=status.HTTP_400_BAD_REQUEST)

        NewsletterSubscription.objects.get(email=email).delete()       

        return Response(status=status.HTTP_200_OK)
