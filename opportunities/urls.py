from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'opportunities', views.OpportunityViewSet)
router.register(r'events', views.EventViewSet, basename='event')

urlpatterns = [
    path('', include(router.urls)),
    path('opportunities/organization/', views.organization_opportunities, name='organization_opportunities'),
    path('opportunities/recommended/', views.recommended_opportunities, name='recommended_opportunities'),
]