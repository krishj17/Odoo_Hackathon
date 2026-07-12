from django.urls import path
from dashboard.views import DashboardStatsView, ReportsView, CSVExportView

urlpatterns = [
    path("stats/", DashboardStatsView.as_view(), name="dashboard-stats"),
    path("reports/", ReportsView.as_view(), name="reports"),
    path("reports/csv/", CSVExportView.as_view(), name="reports-csv"),
]
