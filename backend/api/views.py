from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django_countries.data import COUNTRIES


# Create your views here.


class CountriesService(APIView):
    countries = COUNTRIES
    # format of countries:
    # COUNTRIES = {
    # "AF": _("Afghanistan"),
    # "AX": _("Åland Islands"),
    # "AL": _("Albania"),
    # "DZ": _("Algeria"),
    # "AS": _("American Samoa"),
    def get(self, request, format=None):
        # need to return a list of country names only
        return Response(list(self.countries.values()), status=status.HTTP_200_OK)
        # return Response(self.countries.keys())
        # return Response(self.countries, status=status.HTTP_200_OK)
