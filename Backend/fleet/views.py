from django.db import transaction
from django.utils import timezone
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from fleet.models import Vehicle, Driver, MaintenanceLog
from fleet.serializers import VehicleSerializer, DriverSerializer, MaintenanceLogSerializer
from users.permissions import IsSafetyOfficer, IsFleetManager, CanManageMaintenance


class VehicleViewSet(ModelViewSet):
    queryset = Vehicle.objects.all().order_by("-created_at")
    serializer_class = VehicleSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAuthenticated()]
        elif self.request.method in ['POST', 'PATCH', 'DELETE']:
            return [IsFleetManager()]

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]

    filterset_fields = [
        "status",
        "type",
        "region",
    ]

    search_fields = [
        "registration_number",
        "name_model",
    ]

    ordering_fields = [
        "created_at",
        "odometer",
        "acquisition_cost",
    ]


class DriverViewSet(ModelViewSet):
    queryset = Driver.objects.all().order_by("-created_at")
    serializer_class = DriverSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAuthenticated()]
        elif self.request.method in ['POST', 'PATCH', 'DELETE']:
            return [IsSafetyOfficer()]

    @action(detail=False, methods=["get"], url_path="available")
    def available_drivers(self, request):
        """Return only drivers available for trip assignment.
        Excludes: Suspended drivers, drivers with expired licenses, drivers on trip."""
        today = timezone.now().date()
        drivers = Driver.objects.filter(
            status="available"
        ).exclude(
            license_expiry_date__lt=today
        ).order_by("-created_at")
        serializer = DriverSerializer(drivers, many=True)
        return Response(serializer.data)


class MaintenanceLogViewSet(ModelViewSet):
    queryset = MaintenanceLog.objects.select_related("vehicle")
    serializer_class = MaintenanceLogSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAuthenticated()]
        return [CanManageMaintenance()]

    def perform_create(self, serializer):
        with transaction.atomic():
            maintenance = serializer.save()
            if maintenance.status == "active":
                vehicle = maintenance.vehicle
                vehicle.status = "in_shop"
                vehicle.save(update_fields=["status"])

    def perform_update(self, serializer):
        with transaction.atomic():
            old_status = serializer.instance.status if serializer.instance else None
            maintenance = serializer.save()
            vehicle = maintenance.vehicle

            if old_status == "active" and maintenance.status == "completed":
                # Closing maintenance: restore to Available only if no other active maintenance
                has_other_active = MaintenanceLog.objects.filter(
                    vehicle=vehicle, status="active"
                ).exclude(pk=maintenance.pk).exists()
                if not has_other_active and vehicle.status != "retired":
                    vehicle.status = "available"
                    vehicle.save(update_fields=["status"])

            elif old_status == "completed" and maintenance.status == "active":
                # Reopening maintenance: set to In Shop
                if vehicle.status != "retired":
                    vehicle.status = "in_shop"
                    vehicle.save(update_fields=["status"])