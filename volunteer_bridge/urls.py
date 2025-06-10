from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from accounts.views import RegisterView , current_user, get_user_profile
from volunteer_bridge.debug_views import list_urls
from accounts.views import test_auth

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('accounts.urls')),
    path('api/', include('opportunities.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/users/current/', current_user, name='current_user'),
    path('api/profile/', get_user_profile, name='user_profile'),
    path('api/', include('volunteer_hours.urls')),
    path('api/', include('notifications.urls')),
    path('debug/urls/', list_urls, name='list_urls'),
    path('api/test-auth/', test_auth, name='test_auth'),
]
