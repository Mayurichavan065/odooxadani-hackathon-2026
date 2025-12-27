from django.contrib import admin
from .models import Equipment, MaintenanceTeam, MaintenanceRequest


@admin.register(MaintenanceTeam)
class MaintenanceTeamAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name']
    filter_horizontal = ['members']


@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'serial_number', 'department_or_owner', 'location', 'is_usable', 'created_at']
    list_filter = ['is_usable', 'default_team']
    search_fields = ['name', 'serial_number', 'department_or_owner']
    date_hierarchy = 'purchase_date'


@admin.register(MaintenanceRequest)
class MaintenanceRequestAdmin(admin.ModelAdmin):
    list_display = ['subject', 'equipment', 'request_type', 'status', 'team', 'technician', 'scheduled_date']
    list_filter = ['status', 'request_type', 'team']
    search_fields = ['subject', 'equipment__name']
    date_hierarchy = 'scheduled_date'
    readonly_fields = ['created_at', 'updated_at']
