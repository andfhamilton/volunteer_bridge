from rest_framework.routers import DefaultRouter
from django.urls import path, include
from . import views
from .views import MessageViewSet


# Create a single router instance
router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')
router.register(r'messages', MessageViewSet, basename='message')

urlpatterns = [
    path('', include(router.urls)),
    path('applications/volunteer/', views.volunteer_applications, name='volunteer_applications'),
    path('applications/organization/', views.organization_applications, name='organization_applications'),
    path('opportunities/<int:opportunity_id>/apply/', views.apply_to_opportunity, name='apply_to_opportunity'),
    path('opportunities/<int:opportunity_id>/applications/', views.opportunity_applications, name='opportunity_applications'),
    path('applications/<int:application_id>/', views.update_application_status, name='update_application_status'),
]
