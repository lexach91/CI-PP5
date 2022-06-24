from django.urls import path, re_path
from .views import index

urlpatterns = [
    path('', index, name='index'),
    re_path(r'^(?!api/|dj-rest-auth/|admin/).*', index),
]
