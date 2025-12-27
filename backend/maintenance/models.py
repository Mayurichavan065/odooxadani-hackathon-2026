from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError


class MaintenanceTeam(models.Model):
    """Maintenance team with assigned technicians."""
    name = models.CharField(max_length=200, unique=True)
    members = models.ManyToManyField(User, related_name='maintenance_teams', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Equipment(models.Model):
    """Company equipment that requires maintenance."""
    name = models.CharField(max_length=200)
    serial_number = models.CharField(max_length=100, unique=True)
    department_or_owner = models.CharField(max_length=200)
    location = models.CharField(max_length=200)
    purchase_date = models.DateField()
    warranty_end = models.DateField(null=True, blank=True)
    default_team = models.ForeignKey(
        MaintenanceTeam,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='equipment_assigned'
    )
    default_technician = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='equipment_assigned'
    )
    is_usable = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Equipment'

    def __str__(self):
        return f"{self.name} ({self.serial_number})"


class MaintenanceRequest(models.Model):
    """Maintenance request for equipment."""
    
    REQUEST_TYPE_CHOICES = [
        ('CORRECTIVE', 'Corrective'),
        ('PREVENTIVE', 'Preventive'),
    ]
    
    STATUS_CHOICES = [
        ('NEW', 'New'),
        ('IN_PROGRESS', 'In Progress'),
        ('REPAIRED', 'Repaired'),
        ('SCRAP', 'Scrap'),
    ]
    
    subject = models.CharField(max_length=300)
    equipment = models.ForeignKey(
        Equipment,
        on_delete=models.CASCADE,
        related_name='maintenance_requests'
    )
    request_type = models.CharField(
        max_length=20,
        choices=REQUEST_TYPE_CHOICES,
        default='CORRECTIVE'
    )
    team = models.ForeignKey(
        MaintenanceTeam,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='maintenance_requests'
    )
    technician = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_requests'
    )
    scheduled_date = models.DateTimeField()
    duration = models.DurationField(help_text="Expected duration of maintenance")
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='NEW'
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_requests'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.subject} - {self.equipment.name}"

    def clean(self):
        """Validate business rules."""
        # Validate technician belongs to assigned team
        if self.technician and self.team:
            if not self.team.members.filter(id=self.technician.id).exists():
                raise ValidationError({
                    'technician': f'Technician must be a member of team {self.team.name}'
                })

    def save(self, *args, **kwargs):
        """Auto-assign team from equipment and handle status transitions."""
        # Auto-assign team from equipment if not set
        if not self.team and self.equipment and self.equipment.default_team:
            self.team = self.equipment.default_team
        
        # If status is SCRAP, mark equipment as unusable
        if self.status == 'SCRAP' and self.equipment:
            self.equipment.is_usable = False
            self.equipment.save(update_fields=['is_usable'])
        
        super().save(*args, **kwargs)
