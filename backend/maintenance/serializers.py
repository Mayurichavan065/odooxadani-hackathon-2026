from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Equipment, MaintenanceTeam, MaintenanceRequest


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']


class MaintenanceTeamSerializer(serializers.ModelSerializer):
    """Serializer for MaintenanceTeam."""
    members = UserSerializer(many=True, read_only=True)
    member_ids = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        many=True,
        write_only=True,
        source='members',
        required=False
    )

    class Meta:
        model = MaintenanceTeam
        fields = ['id', 'name', 'members', 'member_ids', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class EquipmentSerializer(serializers.ModelSerializer):
    """Serializer for Equipment."""
    default_team_name = serializers.CharField(source='default_team.name', read_only=True)
    default_technician_name = serializers.CharField(
        source='default_technician.get_full_name',
        read_only=True
    )

    class Meta:
        model = Equipment
        fields = [
            'id', 'name', 'serial_number', 'department_or_owner', 'location',
            'purchase_date', 'warranty_end', 'default_team', 'default_team_name',
            'default_technician', 'default_technician_name', 'is_usable',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class MaintenanceRequestSerializer(serializers.ModelSerializer):
    """Serializer for MaintenanceRequest with business logic validation."""
    equipment_name = serializers.CharField(source='equipment.name', read_only=True)
    team_name = serializers.CharField(source='team.name', read_only=True)
    technician_name = serializers.CharField(
        source='technician.get_full_name',
        read_only=True
    )
    created_by_name = serializers.CharField(
        source='created_by.get_full_name',
        read_only=True
    )

    class Meta:
        model = MaintenanceRequest
        fields = [
            'id', 'subject', 'equipment', 'equipment_name', 'request_type',
            'team', 'team_name', 'technician', 'technician_name',
            'scheduled_date', 'duration', 'status', 'created_by',
            'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, data):
        """Validate business rules."""
        # Auto-assign team from equipment
        equipment = data.get('equipment')
        if equipment and equipment.default_team and not data.get('team'):
            data['team'] = equipment.default_team

        # Validate technician belongs to team
        technician = data.get('technician')
        team = data.get('team')
        
        if technician and team:
            if not team.members.filter(id=technician.id).exists():
                raise serializers.ValidationError({
                    'technician': f'Technician must be a member of team "{team.name}"'
                })

        return data

    def validate_status(self, value):
        """Validate status transitions."""
        if self.instance:  # Only validate on update
            current_status = self.instance.status
            
            # Define valid transitions
            valid_transitions = {
                'NEW': ['IN_PROGRESS'],
                'IN_PROGRESS': ['REPAIRED', 'SCRAP'],
                'REPAIRED': ['SCRAP'],
                'SCRAP': [],
            }
            
            if value != current_status:
                allowed = valid_transitions.get(current_status, [])
                if value not in allowed:
                    raise serializers.ValidationError(
                        f'Invalid status transition from {current_status} to {value}. '
                        f'Allowed transitions: {", ".join(allowed) if allowed else "none"}'
                    )
        
        return value


class MaintenanceRequestCreateSerializer(MaintenanceRequestSerializer):
    """Serializer for creating maintenance requests."""
    class Meta(MaintenanceRequestSerializer.Meta):
        read_only_fields = ['team', 'created_at', 'updated_at']


class StatusUpdateSerializer(serializers.Serializer):
    """Serializer for status updates."""
    status = serializers.ChoiceField(choices=MaintenanceRequest.STATUS_CHOICES)

    def validate_status(self, value):
        """Validate status transitions."""
        request = self.context.get('request_obj')
        if not request:
            return value
            
        current_status = request.status
        
        # Define valid transitions
        valid_transitions = {
            'NEW': ['IN_PROGRESS'],
            'IN_PROGRESS': ['REPAIRED', 'SCRAP'],
            'REPAIRED': ['SCRAP'],
            'SCRAP': [],
        }
        
        if value != current_status:
            allowed = valid_transitions.get(current_status, [])
            if value not in allowed:
                raise serializers.ValidationError(
                    f'Invalid status transition from {current_status} to {value}. '
                    f'Allowed transitions: {", ".join(allowed) if allowed else "none"}'
                )
        
        return value


class TechnicianAssignSerializer(serializers.Serializer):
    """Serializer for assigning technicians."""
    technician = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=True
    )

    def validate_technician(self, value):
        """Validate technician belongs to request's team."""
        request = self.context.get('request_obj')
        if not request:
            return value
            
        if request.team:
            if not request.team.members.filter(id=value.id).exists():
                raise serializers.ValidationError(
                    f'Technician must be a member of team "{request.team.name}"'
                )
        
        return value


class CalendarEventSerializer(serializers.Serializer):
    """Serializer for calendar events."""
    id = serializers.IntegerField()
    title = serializers.CharField()
    start = serializers.DateTimeField()
    end = serializers.DateTimeField()
    equipment = serializers.CharField()
    technician = serializers.CharField()
    status = serializers.CharField()
    request_type = serializers.CharField()
