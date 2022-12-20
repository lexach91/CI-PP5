"""
Django settings for backend project.

Generated by 'django-admin startproject' using Django 4.0.5.

For more information on this file, see
https://docs.djangoproject.com/en/4.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.0/ref/settings/
"""

from pathlib import Path
import os

if os.path.exists("env.py"):
    import env
import cloudinary
import cloudinary.uploader
import cloudinary.api
import dj_database_url
import django_heroku

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get("SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get("DEBUG") == "True"

ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
]

RENDER_EXTERNAL_HOSTNAME = os.environ.get('RENDER_EXTERNAL_HOSTNAME')
if RENDER_EXTERNAL_HOSTNAME:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)


# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "cloudinary_storage",
    "cloudinary",
    "django_countries",
    "rest_framework",
    "corsheaders",
    "django.contrib.sites",
    "channels",
    "profiles",
    "frontend",
    "api",
    "authentication",
    "videorooms",
    "payments",
    "subscriptions",
    "contactus",
]


REST_FRAMEWORK = {
    "EXCEPTION_HANDLER": "authentication.exceptions.status_code_handler",
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
    ],
}

AUTH_USER_MODEL = "profiles.User"

# set username field to email
AUTH_USER_MODEL_USERNAME_FIELD = "email"


SITE_ID = 1

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "django.middleware.common.CommonMiddleware",
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    # 'localhost:8080',
    # '127.0.0.1:8080',
    # 'https://dr-meetings.onrender.com',
    "https://dr-meetings.onrender.com",
]

CORS_ORIGIN_WHITELIST = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "https://dr-meetings.onrender.com",
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "https://dr-meetings.onrender.com",
]

CORS_ALLOW_CREDENTIALS = True


ROOT_URLCONF = "backend.urls"


TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [os.path.join(BASE_DIR.parent, "frontend")],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "backend.wsgi.application"
ASGI_APPLICATION = "backend.asgi.application"


AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
]

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"


# Database
# https://docs.djangoproject.com/en/4.0/ref/settings/#databases


# Password validation
# https://docs.djangoproject.com/en/4.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.0/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.0/howto/static-files/

STATIC_URL = "static/"

STATICFILES_DIRS = [
    os.path.join(BASE_DIR.parent, "frontend/build/static"),
    os.path.join(BASE_DIR.parent, "frontend/build"),
]

STATIC_ROOT = os.path.join(BASE_DIR.parent, "static")
# Default primary key field type
# https://docs.djangoproject.com/en/4.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# Cloudinary settings
cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME"),
    api_key=os.environ.get("CLOUDINARY_API_KEY"),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET"),
    secure=True,
)

STATICFILES_STORAGE = (
    "cloudinary_storage.storage.StaticHashedCloudinaryStorage"
)
DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"

STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY")
STRIPE_PUBLISHABLE_KEY = os.environ.get("STRIPE_PUBLISHABLE_KEY")
STRIPE_WEBHOOK_KEY = os.environ.get("STRIPE_WEBHOOK_KEY")
BASE_URL = os.environ.get("BASE_URL")
if RENDER_EXTERNAL_HOSTNAME:
    BASE_URL = RENDER_EXTERNAL_HOSTNAME


if "DEVELOPMENT" in os.environ:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        },
    }
    CHANNEL_LAYERS = {
        "default": {
            "BACKEND": "channels_redis.core.RedisChannelLayer",
            "CONFIG": {
                "hosts": [("127.0.0.1", 6379)],
                "capacity": 3000,
                "channel_capacity": {
                    "http.request": 3000,
                    "http.response": 3000,
                    "http.websocket": 3000,
                    "websocket.receive": 3000,
                    "websocket.send": 3000,
                    "websocket.disconnect": 3000,
                    "websocket.connect": 3000,
                },
            },
        },
    }
else:
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
    EMAIL_USE_TLS = True
    EMAIL_PORT = 587
    EMAIL_HOST = "smtp.office365.com"
    EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER")
    EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD")
    DATABASES = {
        "default": dj_database_url.parse(os.environ.get("DATABASE_URL")),
    }
    CHANNEL_LAYERS = {
        "default": {
            "BACKEND": "channels_redis.core.RedisChannelLayer",
            "CONFIG": {
                "hosts": [(os.environ.get("REDIS_URL"))],
                "capacity": 3000,
                "expiry": 600,
                "channel_capacity": {
                    "http.request": 3000,
                    "http.response": 3000,
                    "http.websocket": 3000,
                    "websocket.receive": 3000,
                    "websocket.send": 3000,
                    "websocket.disconnect": 3000,
                    "websocket.connect": 3000,
                },
            },
        },
    }
    django_heroku.settings(locals())
