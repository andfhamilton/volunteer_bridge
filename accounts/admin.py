# Register your models here.
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'is_volunteer', 'is_organization')
    list_filter = ('is_volunteer', 'is_organization')
    fieldsets = UserAdmin.fieldsets + (
        ('Volunteer Info', {'fields': ('skills', 'interests')}),
    )

admin.site.register(User, CustomUserAdmin)