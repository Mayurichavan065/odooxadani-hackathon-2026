from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from datetime import timedelta
from .models import Equipment, MaintenanceTeam, MaintenanceRequest
from .serializers import (
    EquipmentSerializer,
    MaintenanceTeamSerializer,
    MaintenanceRequestSerializer,
    MaintenanceRequestCreateSerializer,
    StatusUpdateSerializer,
    TechnicianAssignSerializer,
    CalendarEventSerializer,
)


class EquipmentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for equipment management.
    
    list: Get all equipment
    retrieve: Get single equipment by ID
    create: Create new equipment
    update: Update equipment
    destroy: Delete equipment
    requests: Get all maintenance requests for specific equipment
    """
    queryset = Equipment.objects.all()
    serializer_class = EquipmentSerializer

    @action(detail=True, methods=['get'], url_path='requests')
    def requests(self, request, pk=None):
        """Get all maintenance requests for this equipment."""
        equipment = self.get_object()
        requests = equipment.maintenance_requests.all()
        serializer = MaintenanceRequestSerializer(requests, many=True)
        return Response(serializer.data)


class MaintenanceTeamViewSet(viewsets.ModelViewSet):
    """
    API endpoint for maintenance team management.
    """
    queryset = MaintenanceTeam.objects.all()
    serializer_class = MaintenanceTeamSerializer


class MaintenanceRequestViewSet(viewsets.ModelViewSet):
    """
    API endpoint for maintenance request management.
    
    list: Get all maintenance requests
    retrieve: Get single request by ID
    create: Create new request (auto-assigns team from equipment)
    update: Update request
    destroy: Delete request
    status: Update request status (validates workflow)
    assign: Assign technician (validates team membership)
    """
    queryset = MaintenanceRequest.objects.all()
    serializer_class = MaintenanceRequestSerializer

    def get_serializer_class(self):
        """Use different serializer for create."""
        if self.action == 'create':
            return MaintenanceRequestCreateSerializer
        return MaintenanceRequestSerializer

    def perform_create(self, serializer):
        """Auto-set created_by to current user if available."""
        if self.request.user.is_authenticated:
            serializer.save(created_by=self.request.user)
        else:
            serializer.save()

    @action(detail=True, methods=['post'], url_path='status')
    def update_status(self, request, pk=None):
        """
        Update maintenance request status.
        Validates workflow: NEW → IN_PROGRESS → REPAIRED → SCRAP
        """
        maintenance_request = self.get_object()
        serializer = StatusUpdateSerializer(
            data=request.data,
            context={'request_obj': maintenance_request}
        )
        
        if serializer.is_valid():
            new_status = serializer.validated_data['status']
            maintenance_request.status = new_status
            maintenance_request.save()
            
            # Return updated request
            response_serializer = MaintenanceRequestSerializer(maintenance_request)
            return Response(response_serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='assign')
    def assign_technician(self, request, pk=None):
        """
        Assign technician to maintenance request.
        Validates that technician belongs to request's team.
        """
        maintenance_request = self.get_object()
        serializer = TechnicianAssignSerializer(
            data=request.data,
            context={'request_obj': maintenance_request}
        )
        
        if serializer.is_valid():
            technician = serializer.validated_data['technician']
            maintenance_request.technician = technician
            maintenance_request.save()
            
            # Return updated request
            response_serializer = MaintenanceRequestSerializer(maintenance_request)
            return Response(response_serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CalendarViewSet(viewsets.ViewSet):
    """
    API endpoint for calendar view of preventive maintenance.
    
    list: Get all preventive maintenance requests formatted for calendar
    """
    
    def list(self, request):
        """Get all preventive maintenance requests as calendar events."""
        # Filter for preventive requests only
        preventive_requests = MaintenanceRequest.objects.filter(
            request_type='PREVENTIVE'
        ).select_related('equipment', 'technician', 'team')
        
        # Format as calendar events
        events = []
        for req in preventive_requests:
            # Calculate end time based on duration
            end_time = req.scheduled_date + req.duration if req.duration else req.scheduled_date + timedelta(hours=1)
            
            event = {
                'id': req.id,
                'title': req.subject,
                'start': req.scheduled_date,
                'end': end_time,
                'equipment': req.equipment.name,
                'technician': req.technician.get_full_name() if req.technician else 'Unassigned',
                'status': req.status,
                'request_type': req.request_type,
            }
            events.append(event)
        
        serializer = CalendarEventSerializer(events, many=True)
        return Response(serializer.data)
