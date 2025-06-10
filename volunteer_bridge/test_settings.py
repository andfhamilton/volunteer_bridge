from .settings import *

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'test_volunteerbridge',
        'USER': 'volunteeruser',
        'PASSWORD': 'volunteerpassword',
        'HOST': 'localhost',
        'PORT': '5432',
        'TEST': {
            'NAME': 'test_volunteerbridge',
        },
    }
}
