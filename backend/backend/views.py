from django.http import HttpResponseRedirect
from django.conf import settings

base_url = settings.BASE_URL


def handler404(request, exception):
    return HttpResponseRedirect(base_url+'/404')

def handler500(request):
    return HttpResponseRedirect(base_url+'/500')
