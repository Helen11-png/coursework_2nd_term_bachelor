from django.core.management.base import BaseCommand
from employees.models import Employee
from api.models import Request, Route

# ЗАГЛУШКА ДЛЯ ПРОВЕРКИ!!!!!!!!!!!!!
class Command(BaseCommand):
    def handle(self, *args, **options):
        employee1, created1 = Employee.objects.get_or_create(
            tab_number='001',
            defaults={
                'full_name': 'Иван Иванов',
                'department': 'IT',
                'position': 'Разработчик'
            }
        )
        employee2, created2 = Employee.objects.get_or_create(
            tab_number='002',
            defaults={
                'full_name': 'Петр Петров',
                'department': 'Sales',
                'position': 'Менеджер'
            }
        )
        employee3, created3 = Employee.objects.get_or_create(
            tab_number='003',
            defaults={
                'full_name': 'Мария Сидорова',
                'department': 'HR',
                'position': 'HR-специалист'
            }
        )
        Route.objects.get_or_create(
            request_type='vacation',
            step_number=1,
            defaults={'role': 'manager', 'sla_days': 2}
        )
        Route.objects.get_or_create(
            request_type='vacation',
            step_number=2,
            defaults={'role': 'hr', 'sla_days': 1}
        )
        Route.objects.get_or_create(
            request_type='business_trip',
            step_number=1,
            defaults={'role': 'manager', 'sla_days': 3}
        )
        Route.objects.get_or_create(
            request_type='business_trip',
            step_number=2,
            defaults={'role': 'hr', 'sla_days': 2}
        )
        Request.objects.create(
            employee=employee1,
            request_type='vacation',
            status='draft'
        )
        Request.objects.create(
            employee=employee2,
            request_type='business_trip',
            status='draft'
        )
        Request.objects.create(
            employee=employee3,
            request_type='vacation',
            status='approved'
        )
        self.stdout.write(self.style.SUCCESS('Тестовые данные успешно созданы!'))

# мне на будущее:
# если захочу удалить заглушки, то скрипт:
# Employee.objects.filter(tab_number='001').delete()