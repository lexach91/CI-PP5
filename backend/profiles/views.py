from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from dj_rest_auth.registration.views import RegisterView
from dj_rest_auth.views import LoginView