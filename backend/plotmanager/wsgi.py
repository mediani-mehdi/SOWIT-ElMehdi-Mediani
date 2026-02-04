"""
WSGI config for plotmanager project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'plotmanager.settings')

application = get_wsgi_application()
