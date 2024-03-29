"""
ASGI config for backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.0/howto/deployment/asgi/
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()


from channels.routing import ProtocolTypeRouter, URLRouter  # noqa isort:skip
from channels.auth import AuthMiddlewareStack  # noqa isort:skip
from channels.security.websocket import AllowedHostsOriginValidator  # noqa isort:skip
from django.core.asgi import get_asgi_application  # noqa isort:skip
import videorooms.routing  # noqa isort:skip

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(
                videorooms.routing.websocket_urlpatterns
            )
        )
    ),
})
