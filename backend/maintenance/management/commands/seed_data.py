from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from maintenance.models import Equipment, MaintenanceTeam, MaintenanceRequest
from datetime import datetime, timedelta
from django.utils import timezone


class Command(BaseCommand):
    help = 'Seed database with dummy data for testing'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding database...')

        # Create users (technicians)
        users_data = [
            {'username': 'raj_sharma', 'first_name': 'Raj', 'last_name': 'Sharma', 'email': 'raj@gearguard.com'},
            {'username': 'priya_patel', 'first_name': 'Priya', 'last_name': 'Patel', 'email': 'priya@gearguard.com'},
            {'username': 'arjun_kumar', 'first_name': 'Arjun', 'last_name': 'Kumar', 'email': 'arjun@gearguard.com'},
            {'username': 'sneha_reddy', 'first_name': 'Sneha', 'last_name': 'Reddy', 'email': 'sneha@gearguard.com'},
            {'username': 'vikram_singh', 'first_name': 'Vikram', 'last_name': 'Singh', 'email': 'vikram@gearguard.com'},
        ]

        users = []
        for user_data in users_data:
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults={
                    'first_name': user_data['first_name'],
                    'last_name': user_data['last_name'],
                    'email': user_data['email']
                }
            )
            users.append(user)
            if created:
                self.stdout.write(f'  Created user: {user.username}')

        # Create maintenance teams
        teams_data = [
            {'name': 'Electrical Team', 'members': [users[0], users[1]]},
            {'name': 'Mechanical Team', 'members': [users[2], users[3]]},
            {'name': 'HVAC Team', 'members': [users[3], users[4]]},
            {'name': 'Plumbing Team', 'members': [users[1], users[2]]},
        ]

        teams = []
        for team_data in teams_data:
            team, created = MaintenanceTeam.objects.get_or_create(
                name=team_data['name']
            )
            if created:
                team.members.set(team_data['members'])
                self.stdout.write(f'  Created team: {team.name}')
            teams.append(team)

        # Create equipment
        equipment_data = [
            {
                'name': 'Industrial Generator Model XG-500',
                'serial_number': 'GEN-2024-001',
                'department_or_owner': 'Facilities Department',
                'location': 'Building A - Basement',
                'purchase_date': '2024-01-15',
                'warranty_end': '2027-01-15',
                'default_team': teams[0],
                'default_technician': users[0],
                'is_usable': True,
            },
            {
                'name': 'Air Compressor AC-750',
                'serial_number': 'CMP-2024-002',
                'department_or_owner': 'Manufacturing',
                'location': 'Workshop - Floor 2',
                'purchase_date': '2023-06-20',
                'warranty_end': '2026-06-20',
                'default_team': teams[1],
                'default_technician': users[2],
                'is_usable': True,
            },
            {
                'name': 'HVAC Unit - Central Cooling',
                'serial_number': 'HVAC-2023-003',
                'department_or_owner': 'Building Operations',
                'location': 'Rooftop - Building B',
                'purchase_date': '2023-03-10',
                'warranty_end': '2028-03-10',
                'default_team': teams[2],
                'default_technician': users[3],
                'is_usable': True,
            },
            {
                'name': 'Water Pump System WP-300',
                'serial_number': 'WP-2024-004',
                'department_or_owner': 'Utilities',
                'location': 'Basement - Water Treatment',
                'purchase_date': '2024-02-01',
                'warranty_end': '2029-02-01',
                'default_team': teams[3],
                'default_technician': users[1],
                'is_usable': True,
            },
            {
                'name': 'Conveyor Belt System CB-1200',
                'serial_number': 'CB-2022-005',
                'department_or_owner': 'Production Line',
                'location': 'Factory Floor - Section C',
                'purchase_date': '2022-08-15',
                'warranty_end': '2025-08-15',
                'default_team': teams[1],
                'default_technician': users[4],
                'is_usable': False,  # This one needs repair
            },
            {
                'name': 'Backup Generator BG-200',
                'serial_number': 'GEN-2023-006',
                'department_or_owner': 'Emergency Services',
                'location': 'Building C - Generator Room',
                'purchase_date': '2023-11-20',
                'warranty_end': '2026-11-20',
                'default_team': teams[0],
                'default_technician': users[0],
                'is_usable': True,
            },
        ]

        equipment_list = []
        for eq_data in equipment_data:
            equipment, created = Equipment.objects.get_or_create(
                serial_number=eq_data['serial_number'],
                defaults=eq_data
            )
            equipment_list.append(equipment)
            if created:
                self.stdout.write(f'  Created equipment: {equipment.name}')

        # Create maintenance requests
        now = timezone.now()
        requests_data = [
            {
                'subject': 'Monthly preventive maintenance check',
                'equipment': equipment_list[0],
                'request_type': 'PREVENTIVE',
                'team': teams[0],
                'technician': users[0],
                'scheduled_date': now + timedelta(days=7),
                'duration': timedelta(hours=2),
                'status': 'NEW',
                'created_by': users[0],
            },
            {
                'subject': 'Strange noise during operation',
                'equipment': equipment_list[1],
                'request_type': 'CORRECTIVE',
                'team': teams[1],
                'technician': users[2],
                'scheduled_date': now + timedelta(days=1),
                'duration': timedelta(hours=3),
                'status': 'IN_PROGRESS',
                'created_by': users[2],
            },
            {
                'subject': 'Quarterly HVAC filter replacement',
                'equipment': equipment_list[2],
                'request_type': 'PREVENTIVE',
                'team': teams[2],
                'technician': users[3],
                'scheduled_date': now + timedelta(days=14),
                'duration': timedelta(hours=1, minutes=30),
                'status': 'NEW',
                'created_by': users[3],
            },
            {
                'subject': 'Water leak detected',
                'equipment': equipment_list[3],
                'request_type': 'CORRECTIVE',
                'team': teams[3],
                'technician': users[1],
                'scheduled_date': now + timedelta(hours=4),
                'duration': timedelta(hours=4),
                'status': 'NEW',
                'created_by': users[1],
            },
            {
                'subject': 'Belt replacement and alignment',
                'equipment': equipment_list[4],
                'request_type': 'CORRECTIVE',
                'team': teams[1],
                'technician': users[4],
                'scheduled_date': now - timedelta(days=2),
                'duration': timedelta(hours=6),
                'status': 'REPAIRED',
                'created_by': users[4],
            },
            {
                'subject': 'Annual safety inspection',
                'equipment': equipment_list[5],
                'request_type': 'PREVENTIVE',
                'team': teams[0],
                'technician': users[0],
                'scheduled_date': now + timedelta(days=30),
                'duration': timedelta(hours=2),
                'status': 'NEW',
                'created_by': users[0],
            },
            {
                'subject': 'Oil change and fluid check',
                'equipment': equipment_list[0],
                'request_type': 'PREVENTIVE',
                'team': teams[0],
                'technician': users[1],
                'scheduled_date': now + timedelta(days=21),
                'duration': timedelta(hours=1),
                'status': 'NEW',
                'created_by': users[0],
            },
            {
                'subject': 'Pressure gauge malfunction',
                'equipment': equipment_list[1],
                'request_type': 'CORRECTIVE',
                'team': teams[1],
                'technician': users[2],
                'scheduled_date': now + timedelta(days=3),
                'duration': timedelta(hours=2),
                'status': 'NEW',
                'created_by': users[2],
            },
        ]

        for req_data in requests_data:
            request, created = MaintenanceRequest.objects.get_or_create(
                subject=req_data['subject'],
                equipment=req_data['equipment'],
                defaults=req_data
            )
            if created:
                self.stdout.write(f'  Created request: {request.subject}')

        self.stdout.write(self.style.SUCCESS('\n✓ Database seeded successfully!'))
        self.stdout.write(f'  {len(users)} users')
        self.stdout.write(f'  {len(teams)} teams')
        self.stdout.write(f'  {len(equipment_list)} equipment items')
        self.stdout.write(f'  {len(requests_data)} maintenance requests')
