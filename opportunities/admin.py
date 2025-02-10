from django.contrib import admin
from .models import Opportunity

@admin.register(Opportunity)
class OpportunityAdmin(admin.ModelAdmin):
    list_display = ('title', 'organization', 'status', 'start_date', 'end_date')
    list_filter = ('status', 'created_at')
    search_fields = ('title', 'description', 'location')