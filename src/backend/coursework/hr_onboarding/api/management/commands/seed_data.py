from django.core.management.base import BaseCommand
from employees.models import Employee
from api.models import Request, Route

# ЗАГЛУШКА ДЛЯ ПРОВЕРКИ!!!!!!!!!!!!!
class Command(BaseCommand):
    def handle(self, *args, **options):
        employee, created = Employee.objects.get_or_create(
            tab_number='001',
            defaults={
                'full_name': 'Иван Иванов',
                'department': 'IT',
                'position': 'Разработчик'
            }
        )
        if created:
            self.stdout.write('Создан сотрудник Иван Иванов')
        else:
            self.stdout.write('Сотрудник Иван Иванов уже существует')
        route1, created1 = Route.objects.get_or_create(
            request_type='vacation',
            step_number=1,
            defaults={
                'role': 'manager',
                'sla_days': 2
            }
        )
        route2, created2 = Route.objects.get_or_create(
            request_type='vacation',
            step_number=2,
            defaults={
                'role': 'hr',
                'sla_days': 1
            }
        )
        Request.objects.create(
            employee=employee,
            request_type='vacation',
            status='draft'
        )
        self.stdout.write('Тестовые данные успешно обработаны!')

# мне на будущее:
# если захочу удалить заглушки, то скрипт:
# Employee.objects.filter(tab_number='001').delete()