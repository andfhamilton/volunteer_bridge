from rest_framework.routers import DefaultRouter
from django.urls import path, include
from . import views
from .views import MessageViewSet

router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')

router = DefaultRouter()
router.register(r'messages', MessageViewSet, basename='message')

urlpatterns = [
    path('', include(router.urls)),
]