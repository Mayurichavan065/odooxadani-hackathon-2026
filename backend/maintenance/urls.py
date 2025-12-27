from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EquipmentViewSet,
    MaintenanceTeamViewSet,
    MaintenanceRequestViewSet,
    CalendarViewSet,
)

router = DefaultRouter()
router.register(r'equipment', EquipmentViewSet, basename='equipment')
router.register(r'teams', MaintenanceTeamViewSet, basename='team')
router.register(r'requests', MaintenanceRequestViewSet, basename='request')
router.register(r'calendar', CalendarViewSet, basename='calendar')

urlpatterns = [
    path('', include(router.urls)),
]
