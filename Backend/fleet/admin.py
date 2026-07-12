from django.contrib import admin
from fleet.models import Vehicle, Driver, MaintenanceLog

@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('registration_number', 'name_model', 'type', 'status', 'odometer', 'acquisition_cost', 'created_at')
    list_filter = ('status', 'type')
    search_fields = ('registration_number', 'name_model')

@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display = ('name', 'license_number', 'license_category', 'contact_number', 'status', 'license_expiry_date')
    list_filter = ('status', 'license_category')
    search_fields = ('name', 'license_number')

@admin.register(MaintenanceLog)
class MaintenanceLogAdmin(admin.ModelAdmin):
    list_display = ('vehicle', 'service_type', 'cost', 'service_date', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('service_type',)
