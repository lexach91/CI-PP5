from django.urls import path, re_path
from .views import index

urlpatterns = [
    path('', index, name='index'),
    # make all paths handled by frontend
    re_path(r'^.*', index),
]
