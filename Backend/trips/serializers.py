from rest_framework import serializers
from trips.models import Trip, Expense
from fleet.models import Vehicle


class TripSerializer(serializers.ModelSerializer):
    vehicle_registration = serializers.CharField(source='vehicle.registration_number', read_only=True, default=None)
    vehicle_name = serializers.CharField(source='vehicle.name_model', read_only=True, default=None)
    vehicle_capacity = serializers.DecimalField(source='vehicle.max_load_capacity_kg', max_digits=10, decimal_places=2, read_only=True, default=None)
    vehicle_status = serializers.CharField(source='vehicle.status', read_only=True, default=None)
    driver_name = serializers.CharField(source='driver.name', read_only=True, default=None)

    class Meta:
        model = Trip
        fields = "__all__"
        read_only_fields = ("created_at", "created_by")

    def validate_trip_code(self, value):
        if not value.startswith("TR"):
            raise serializers.ValidationError("Trip code must start with 'TR'.")
        return value

    def validate(self, attrs):
        vehicle = attrs.get("vehicle")
        cargo_weight = attrs.get("cargo_weight_kg")

        if vehicle is not None and cargo_weight is not None:
            capacity = vehicle.max_load_capacity_kg
            if cargo_weight > capacity:
                raise serializers.ValidationError({
                    "cargo_weight_kg": f"Cargo weight ({cargo_weight} kg) exceeds vehicle maximum capacity ({capacity} kg). Trip cannot be created."
                })

        status = attrs.get("status", None)
        if status == "completed":
            final_odometer = attrs.get("final_odometer", None)
            fuel_consumed = attrs.get("fuel_consumed_l", None)
            if final_odometer is None or fuel_consumed is None:
                raise serializers.ValidationError({
                    "detail": "Final odometer and fuel consumed are required to complete a trip."
                })

        return attrs

    def create(self, validated_data):
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)


class TripCompleteSerializer(serializers.Serializer):
    final_odometer = serializers.DecimalField(max_digits=10, decimal_places=2)
    fuel_consumed_l = serializers.DecimalField(max_digits=10, decimal_places=2)


class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = "__all__"
        read_only_fields = ("created_at",)
