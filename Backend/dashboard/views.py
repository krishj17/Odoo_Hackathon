import csv
from decimal import Decimal
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, F, Q
from django.http import HttpResponse
from fleet.models import Vehicle, Driver, MaintenanceLog
from trips.models import Trip, Expense


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total_vehicles = Vehicle.objects.count()
        available_vehicles = Vehicle.objects.filter(status="available").count()
        on_trip_vehicles = Vehicle.objects.filter(status="on_trip").count()
        in_shop_vehicles = Vehicle.objects.filter(status="in_shop").count()
        retired_vehicles = Vehicle.objects.filter(status="retired").count()

        total_drivers = Driver.objects.count()
        available_drivers = Driver.objects.filter(status="available").count()
        on_trip_drivers = Driver.objects.filter(status="on_trip").count()

        total_trips = Trip.objects.count()
        draft_trips = Trip.objects.filter(status="draft").count()
        dispatched_trips = Trip.objects.filter(status="dispatched").count()
        completed_trips = Trip.objects.filter(status="completed").count()
        cancelled_trips = Trip.objects.filter(status="cancelled").count()

        total_maintenance_cost = MaintenanceLog.objects.aggregate(
            total=Sum("cost")
        )["total"] or 0

        total_expenses = Expense.objects.aggregate(
            total=Sum("amount")
        )["total"] or 0

        total_acquisition_cost = Vehicle.objects.aggregate(
            total=Sum("acquisition_cost")
        )["total"] or 0

        # Fleet utilization = (On Trip + In Shop) / Total * 100
        active_vehicles = on_trip_vehicles + in_shop_vehicles
        fleet_utilization = (active_vehicles / total_vehicles * 100) if total_vehicles > 0 else 0

        return Response({
            "total_vehicles": total_vehicles,
            "available_vehicles": available_vehicles,
            "on_trip_vehicles": on_trip_vehicles,
            "in_shop_vehicles": in_shop_vehicles,
            "retired_vehicles": retired_vehicles,
            "total_drivers": total_drivers,
            "available_drivers": available_drivers,
            "on_trip_drivers": on_trip_drivers,
            "total_trips": total_trips,
            "draft_trips": draft_trips,
            "dispatched_trips": dispatched_trips,
            "completed_trips": completed_trips,
            "cancelled_trips": cancelled_trips,
            "total_maintenance_cost": str(total_maintenance_cost),
            "total_expenses": str(total_expenses),
            "total_acquisition_cost": str(total_acquisition_cost),
            "fleet_utilization": round(fleet_utilization, 1),
        })


class ReportsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        vehicles = Vehicle.objects.all()
        report_data = []

        for vehicle in vehicles:
            # Fuel efficiency = Total Distance / Total Fuel (for completed trips)
            trips = Trip.objects.filter(vehicle=vehicle, status="completed")
            total_distance = trips.aggregate(total=Sum("planned_distance_km"))["total"] or Decimal("0")
            total_fuel = trips.aggregate(total=Sum("fuel_consumed_l"))["total"] or Decimal("0")
            fuel_efficiency = (total_distance / total_fuel) if total_fuel > 0 else Decimal("0")

            # Operational costs
            fuel_cost = Expense.objects.filter(
                vehicle=vehicle, expense_type="fuel"
            ).aggregate(total=Sum("amount"))["total"] or Decimal("0")

            maintenance_cost = MaintenanceLog.objects.filter(
                vehicle=vehicle
            ).aggregate(total=Sum("cost"))["total"] or Decimal("0")

            other_expenses = Expense.objects.filter(
                vehicle=vehicle
            ).exclude(expense_type="fuel").aggregate(total=Sum("amount"))["total"] or Decimal("0")

            total_operational_cost = fuel_cost + maintenance_cost + other_expenses

            # Revenue and ROI
            total_revenue = trips.aggregate(total=Sum("revenue"))["total"] or Decimal("0")
            roi = (
                ((total_revenue - total_operational_cost) / vehicle.acquisition_cost * 100)
                if vehicle.acquisition_cost > 0
                else Decimal("0")
            )

            report_data.append({
                "vehicle_id": vehicle.id,
                "registration_number": vehicle.registration_number,
                "name_model": vehicle.name_model,
                "type": vehicle.type,
                "status": vehicle.status,
                "odometer": str(vehicle.odometer),
                "acquisition_cost": str(vehicle.acquisition_cost),
                "total_trips": trips.count(),
                "total_distance_km": str(total_distance),
                "total_fuel_l": str(total_fuel),
                "fuel_efficiency": str(round(fuel_efficiency, 2)),
                "fuel_cost": str(fuel_cost),
                "maintenance_cost": str(maintenance_cost),
                "other_expenses": str(other_expenses),
                "total_operational_cost": str(total_operational_cost),
                "total_revenue": str(total_revenue),
                "roi_percent": str(round(roi, 1)),
            })

        return Response(report_data)


class CSVExportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        vehicles = Vehicle.objects.all()
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="fleet_report.csv"'

        writer = csv.writer(response)
        writer.writerow([
            'Registration', 'Name/Model', 'Type', 'Status', 'Odometer',
            'Acquisition Cost', 'Total Trips', 'Total Distance (km)',
            'Total Fuel (L)', 'Fuel Efficiency', 'Fuel Cost', 'Maintenance Cost',
            'Other Expenses', 'Total Operational Cost', 'Revenue', 'ROI %'
        ])

        for vehicle in vehicles:
            trips = Trip.objects.filter(vehicle=vehicle, status="completed")
            total_distance = trips.aggregate(total=Sum("planned_distance_km"))["total"] or Decimal("0")
            total_fuel = trips.aggregate(total=Sum("fuel_consumed_l"))["total"] or Decimal("0")
            fuel_efficiency = (total_distance / total_fuel) if total_fuel > 0 else Decimal("0")

            fuel_cost = Expense.objects.filter(
                vehicle=vehicle, expense_type="fuel"
            ).aggregate(total=Sum("amount"))["total"] or Decimal("0")

            maintenance_cost = MaintenanceLog.objects.filter(
                vehicle=vehicle
            ).aggregate(total=Sum("cost"))["total"] or Decimal("0")

            other_expenses = Expense.objects.filter(
                vehicle=vehicle
            ).exclude(expense_type="fuel").aggregate(total=Sum("amount"))["total"] or Decimal("0")

            total_operational_cost = fuel_cost + maintenance_cost + other_expenses
            total_revenue = trips.aggregate(total=Sum("revenue"))["total"] or Decimal("0")
            roi = (
                ((total_revenue - total_operational_cost) / vehicle.acquisition_cost * 100)
                if vehicle.acquisition_cost > 0
                else Decimal("0")
            )

            writer.writerow([
                vehicle.registration_number,
                vehicle.name_model,
                vehicle.type,
                vehicle.status,
                vehicle.odometer,
                vehicle.acquisition_cost,
                trips.count(),
                total_distance,
                total_fuel,
                round(fuel_efficiency, 2),
                fuel_cost,
                maintenance_cost,
                other_expenses,
                total_operational_cost,
                total_revenue,
                round(roi, 1),
            ])

        return response
