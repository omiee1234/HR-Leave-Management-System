import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from leaves.models import LeaveBalance

User = get_user_model()

def seed():
    print("Seeding database...")
    
    # 1. Create Manager
    manager_email = 'manager@company.com'
    if not User.objects.filter(email=manager_email).exists():
        User.objects.create_superuser(
            email=manager_email,
            name='Jane Manager',
            password='password123'
        )
        print(f"Manager created: {manager_email}")
    else:
        print(f"Manager {manager_email} already exists.")

    # 2. Create Employee
    employee_email = 'employee@company.com'
    if not User.objects.filter(email=employee_email).exists():
        User.objects.create_user(
            email=employee_email,
            name='John Employee',
            password='password123',
            role='employee'
        )
        print(f"Employee created: {employee_email}")
    else:
        print(f"Employee {employee_email} already exists.")
        
    print("Database seeding completed successfully!")

if __name__ == '__main__':
    seed()
