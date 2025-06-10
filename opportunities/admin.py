from django.contrib import admin
from .models import Opportunity, Event

@admin.register(Opportunity)
class OpportunityAdmin(admin.ModelAdmin):
    list_display = ('title', 'organization', 'status', 'start_date', 'end_date')
    list_filter = ('status', 'created_at')
    search_fields = ('title', 'description', 'location')

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_by', 'start_time', 'end_time', 'location')
    list_filter = ('created_at',)
    search_fields = ('title', 'description', 'location')