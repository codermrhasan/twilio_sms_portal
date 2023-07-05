"""
ASGI config for main project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

# import os

# from django.core.asgi import get_asgi_application

# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'main.settings')

# application = get_asgi_application()

import os
from django.core.asgi import get_asgi_application
import django
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import apps.portal.routing

from dotenv import load_dotenv


# Loading environment variables file
load_dotenv(
    os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
)

# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'main.settings')
# django.setup()

# application = ProtocolTypeRouter({
#     'http': get_asgi_application(),
#     'websocket': AuthMiddlewareStack(
#         URLRouter(
#             apps.portal.routing.websocket_urlpatterns
#         )
#     ),
# })


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'main.settings')

application = ProtocolTypeRouter(
    {
        'http': get_asgi_application(),
        'websocket': URLRouter(apps.portal.routing.websocket_urlpatterns),
    }
)
