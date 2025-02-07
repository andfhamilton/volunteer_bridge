# accounts/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'get_user_type', 'date_joined')
    list_filter = ('is_active', 'is_staff', 'is_volunteer', 'is_organization')
    fieldsets = UserAdmin.fieldsets + (
        ('User Type', {'fields': ('is_volunteer', 'is_organization')}),
        ('Additional Information', {'fields': ('phone', 'address', 'bio', 'skills', 'interests')}),
    )

    def get_user_type(self, obj):
        if obj.is_volunteer:
            return 'Volunteer'
        elif obj.is_organization:
            return 'Organization'
        return 'Regular User'
    get_user_type.short_description = 'User Type'

admin.site.register(User, CustomUserAdmin)
