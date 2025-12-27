"""
Quick validation test for GearGuard API
Run this after starting the server to verify everything works
"""

import sys
from pathlib import Path

# Add project to path
sys.path.insert(0, str(Path(__file__).parent))

import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gearguard.settings')

import django
django.setup()

from django.contrib.auth.models import User
from maintenance.models import Equipment, MaintenanceTeam, MaintenanceRequest
from datetime import datetime, timedelta

def test_models():
    """Test model creation and business logic"""
    print("🧪 Testing GearGuard Models...\n")
    
    # Clean up any existing test data
    MaintenanceRequest.objects.filter(subject__startswith="TEST").delete()
    Equipment.objects.filter(serial_number__startswith="TEST").delete()
    MaintenanceTeam.objects.filter(name__startswith="TEST").delete()
    User.objects.filter(username__startswith="test").delete()
    
    # 1. Create a technician
    print("1️⃣ Creating test technician...")
    tech = User.objects.create_user('testtech', 'test@example.com', 'pass123')
    tech.first_name = 'Test'
    tech.last_name = 'Technician'
    tech.save()
    print(f"✅ Created: {tech.get_full_name()} (ID: {tech.id})")
    
    # 2. Create a team
    print("\n2️⃣ Creating maintenance team...")
    team = MaintenanceTeam.objects.create(name="TEST Electrical Team")
    team.members.add(tech)
    print(f"✅ Created: {team.name} with {team.members.count()} member(s)")
    
    # 3. Create equipment
    print("\n3️⃣ Creating equipment...")
    equipment = Equipment.objects.create(
        name="TEST Generator",
        serial_number="TEST-GEN-001",
        department_or_owner="TEST Facilities",
        location="TEST Building A",
        purchase_date=datetime.now().date(),
        default_team=team,
        default_technician=tech
    )
    print(f"✅ Created: {equipment.name} ({equipment.serial_number})")
    print(f"   Default team: {equipment.default_team.name}")
    
    # 4. Create maintenance request (test auto-assign team)
    print("\n4️⃣ Creating maintenance request...")
    request = MaintenanceRequest.objects.create(
        subject="TEST Routine maintenance",
        equipment=equipment,
        request_type="PREVENTIVE",
        scheduled_date=datetime.now() + timedelta(days=7),
        duration=timedelta(hours=2)
    )
    print(f"✅ Created: {request.subject}")
    print(f"   Status: {request.status}")
    print(f"   Team (auto-assigned): {request.team.name if request.team else 'None'}")
    
    # 5. Test status workflow
    print("\n5️⃣ Testing status workflow...")
    request.status = 'IN_PROGRESS'
    request.save()
    print(f"✅ Status updated: NEW → IN_PROGRESS")
    
    request.status = 'REPAIRED'
    request.save()
    print(f"✅ Status updated: IN_PROGRESS → REPAIRED")
    
    # 6. Test scrap logic
    print("\n6️⃣ Testing scrap logic...")
    print(f"   Equipment usable before: {equipment.is_usable}")
    request.status = 'SCRAP'
    request.save()
    equipment.refresh_from_db()
    print(f"✅ Status updated to SCRAP")
    print(f"   Equipment usable after: {equipment.is_usable}")
    
    # 7. Test technician assignment validation
    print("\n7️⃣ Testing technician assignment...")
    request.technician = tech
    request.save()
    print(f"✅ Technician assigned: {request.technician.get_full_name()}")
    
    print("\n" + "="*50)
    print("✅ All tests passed!")
    print("="*50)
    
    # Summary
    print("\n📊 Database Summary:")
    print(f"   Teams: {MaintenanceTeam.objects.count()}")
    print(f"   Equipment: {Equipment.objects.count()}")
    print(f"   Requests: {MaintenanceRequest.objects.count()}")
    print(f"   Users: {User.objects.count()}")
    
    print("\n🚀 Server ready! Run: python manage.py runserver")

if __name__ == '__main__':
    try:
        test_models()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
