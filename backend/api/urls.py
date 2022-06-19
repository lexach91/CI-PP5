from django.urls import path
from .views import CountriesService


urlpatterns = [
    path('countries/', CountriesService.as_view(), name='countries'),
]
