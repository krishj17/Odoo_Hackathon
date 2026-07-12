from rest_framework import serializers
from fleet.models import Vehicle, Driver, MaintenanceLog


class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = "__all__"
        read_only_fields = ("created_at",)


class DriverSerializer(serializers.ModelSerializer):
    class Meta:
        model = Driver
        fields = "__all__"
        read_only_fields = ("created_at",)


class MaintenanceLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenanceLog
        fields = "__all__"
        read_only_fields = ("created_at",)

    def validate(self, attrs):
        vehicle = attrs["vehicle"]
        status = attrs.get("status", "active")

        if status == "active":
            # find logs for vehicle whose status is active.
            qs = MaintenanceLog.objects.filter(
                vehicle=vehicle,
                status="active",
            )
            # if updating existing log skip the validation.
            if self.instance: 
                qs = qs.exclude(pk=self.instance.pk)
            # if creating new active log, throw error if an active status log already exists.
            if qs.exists():
                raise serializers.ValidationError(
                    "This vehicle already has an active maintenance record."
                )

        return attrs