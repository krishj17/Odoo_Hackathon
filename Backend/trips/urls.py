from django.urls import path, include
from rest_framework.routers import DefaultRouter
from trips.views import TripViewSet, ExpenseViewSet

router = DefaultRouter()
router.register("trips", TripViewSet, basename="trips")
router.register("expenses", ExpenseViewSet, basename="expenses")

urlpatterns = [
    path("", include(router.urls)),
]
