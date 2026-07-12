from django.contrib import admin
from trips.models import Trip, Expense

@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ('trip_code', 'source', 'destination', 'status', 'vehicle', 'driver', 'created_at')
    list_filter = ('status',)
    search_fields = ('trip_code', 'source', 'destination')

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('expense_type', 'vehicle', 'trip', 'amount', 'created_at')
    list_filter = ('expense_type',)
    search_fields = ('expense_type', 'description')
