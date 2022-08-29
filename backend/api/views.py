from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django_countries.data import COUNTRIES


# Create your views here.


class CountriesService(APIView):
    countries = COUNTRIES

    def get(self, request, format=None):
        return Response(
            list(self.countries.values()), status=status.HTTP_200_OK
        )
