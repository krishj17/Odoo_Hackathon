from django.db import transaction
from django.utils import timezone
from rest_framework import serializers
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from trips.models import Trip, Expense
from trips.serializers import TripSerializer, TripCompleteSerializer, ExpenseSerializer
from users.permissions import IsDispatcher, CanManageExpenses


class TripViewSet(ModelViewSet):
    queryset = Trip.objects.select_related("vehicle", "driver", "created_by").order_by("-created_at")
    serializer_class = TripSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAuthenticated()]
        return [IsDispatcher()]

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["status", "vehicle", "driver"]
    search_fields = ["trip_code", "source", "destination"]
    ordering_fields = ["created_at", "planned_distance_km"]

    def perform_update(self, serializer):
        with transaction.atomic():
            old_status = serializer.instance.status if serializer.instance else None
            trip = serializer.save()
            new_status = trip.status

            if new_status == "dispatched" and old_status != "dispatched":
                # Validate vehicle is available
                if trip.vehicle and trip.vehicle.status != "available":
                    raise serializers.ValidationError({
                        "vehicle": f"Vehicle '{trip.vehicle.name_model}' is not available (status: {trip.vehicle.get_status_display()})."
                    })

                # Validate driver is available
                today = timezone.now().date()
                if trip.driver:
                    if trip.driver.status != "available":
                        raise serializers.ValidationError({
                            "driver": f"Driver '{trip.driver.name}' is not available (status: {trip.driver.get_status_display()})."
                        })
                    if trip.driver.license_expiry_date < today:
                        raise serializers.ValidationError({
                            "driver": f"Driver '{trip.driver.name}' has an expired license."
                        })

                trip.dispatched_at = timezone.now()
                trip.save(update_fields=["dispatched_at"])
                if trip.vehicle:
                    trip.vehicle.status = "on_trip"
                    trip.vehicle.save(update_fields=["status"])
                if trip.driver:
                    trip.driver.status = "on_trip"
                    trip.driver.save(update_fields=["status"])

    @action(detail=True, methods=["post"], url_path="complete")
    def complete_trip(self, request, pk=None):
        trip = self.get_object()

        if trip.status != "dispatched":
            return Response(
                {"detail": "Only dispatched trips can be completed."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = TripCompleteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        final_odometer = serializer.validated_data["final_odometer"]
        fuel_consumed = serializer.validated_data["fuel_consumed_l"]

        with transaction.atomic():
            trip.final_odometer = final_odometer
            trip.fuel_consumed_l = fuel_consumed
            trip.completed_at = timezone.now()
            trip.status = "completed"
            trip.save(update_fields=["final_odometer", "fuel_consumed_l", "completed_at", "status"])

            if trip.vehicle:
                trip.vehicle.odometer = final_odometer
                if trip.vehicle.status != "retired":
                    trip.vehicle.status = "available"
                trip.vehicle.save(update_fields=["odometer", "status"])

            if trip.driver:
                trip.driver.status = "available"
                trip.driver.save(update_fields=["status"])

        return Response(TripSerializer(trip, context={"request": request}).data)

    @action(detail=True, methods=["post"], url_path="cancel")
    def cancel_trip(self, request, pk=None):
        trip = self.get_object()

        if trip.status not in ("draft", "dispatched"):
            return Response(
                {"detail": "Only draft or dispatched trips can be cancelled."},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            trip.status = "cancelled"
            trip.save(update_fields=["status"])

            # Only restore vehicle/driver if trip was dispatched
            if trip.status == "cancelled" and trip.vehicle:
                if trip.vehicle.status == "on_trip":
                    trip.vehicle.status = "available"
                    trip.vehicle.save(update_fields=["status"])

            if trip.driver:
                if trip.driver.status == "on_trip":
                    trip.driver.status = "available"
                    trip.driver.save(update_fields=["status"])

        return Response(TripSerializer(trip, context={"request": request}).data)


class ExpenseViewSet(ModelViewSet):
    queryset = Expense.objects.select_related("vehicle", "trip")
    serializer_class = ExpenseSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAuthenticated()]
        return [CanManageExpenses()]

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["vehicle", "trip", "expense_type"]
    search_fields = ["expense_type", "description"]
    ordering_fields = ["created_at", "amount"]
