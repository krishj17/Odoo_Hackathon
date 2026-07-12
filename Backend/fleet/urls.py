from django.urls import path, include
from rest_framework.routers import DefaultRouter
from fleet.views import VehicleViewSet, DriverViewSet, MaintenanceLogViewSet

router = DefaultRouter()
router.register("vehicles", VehicleViewSet, basename="vehicles")
router.register("drivers", DriverViewSet, basename="drivers")
router.register("maintenance", MaintenanceLogViewSet, basename="maintenance")

urlpatterns = [
    path("", include(router.urls)),
]