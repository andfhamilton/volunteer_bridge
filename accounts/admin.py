# Register your models here.
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'is_volunteer', 'is_organization', 'date_joined')
    list_filter = ('is_volunteer', 'is_organization', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('Volunteer Information', {'fields': ('skills', 'interests', 'phone', 'address', 'bio')}),
    )

admin.site.register(User, CustomUserAdmin)