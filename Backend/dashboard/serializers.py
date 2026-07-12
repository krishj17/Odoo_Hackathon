from rest_framework import serializers


class DashboardStatsSerializer(serializers.Serializer):
    total_vehicles = serializers.IntegerField()
    available_vehicles = serializers.IntegerField()
    on_trip_vehicles = serializers.IntegerField()
    in_shop_vehicles = serializers.IntegerField()
    retired_vehicles = serializers.IntegerField()
    total_drivers = serializers.IntegerField()
    available_drivers = serializers.IntegerField()
    on_trip_drivers = serializers.IntegerField()
    total_trips = serializers.IntegerField()
    draft_trips = serializers.IntegerField()
    dispatched_trips = serializers.IntegerField()
    completed_trips = serializers.IntegerField()
    cancelled_trips = serializers.IntegerField()
    total_maintenance_cost = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_expenses = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_acquisition_cost = serializers.DecimalField(max_digits=14, decimal_places=2)
