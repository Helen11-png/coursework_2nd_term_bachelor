from django.core.management.base import BaseCommand
from employees.models import Employee
from api.models import Request, Route, ApprovalStep

# ЗАГЛУШКА ДЛЯ ПРОВЕРКИ!!!!!!!!!!!!!
class Command(BaseCommand):
    def handle(self, *args, **options):
        import os
        self.stdout.write("🔍 Проверка путей:")
        self.stdout.write(f"Текущая папка: {os.getcwd()}")

        # Проверим разные варианты путей
        paths_to_check = [
            '../../../data',
            '../../../../data',
            'data',
            os.path.join(os.getcwd(), 'data')
        ]

        for path in paths_to_check:
            exists = os.path.exists(path)
            full_path = os.path.abspath(path)
            self.stdout.write(f"Путь {path}: {'✅ существует' if exists else '❌ нет'} -> {full_path}")

        # Создадим папку data в корне, если её нет
        root_data = os.path.join(os.path.dirname(
            os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))), 'data')
        self.stdout.write(f"Корневая data: {root_data}")
        os.makedirs(root_data, exist_ok=True)
        self.stdout.write(f"✅ Папка создана: {root_data}")

        # ===== ОСНОВНОЙ КОД =====
        # Теперь используем корневую data
        data_dir = root_data
        with open(os.path.join(data_dir, 'employees.csv'), 'w', newline='', encoding='utf-8') as f:
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
            req1=Request.objects.create(
                employee=employee1,
                request_type='vacation',
                status='draft'
            )
            req1.create_approval_steps()
            req2=Request.objects.create(
                employee=employee2,
                request_type='business_trip',
                status='draft'
            )
            req2.create_approval_steps()
            req3=Request.objects.create(
                employee=employee3,
                request_type='vacation',
                status='approved',
                approved_at='2026-02-22 22:59:04'
            )
            req3.create_approval_steps()
            steps = req3.steps.all()
            for step in steps:
                step.status = 'approved'
                step.acted_at = '2026-02-22 22:59:04'
                step.save()
            self.stdout.write(self.style.SUCCESS('Тестовые данные успешно созданы!'))

# мне на будущее:
# если захочу удалить заглушки, то скрипт:
# Employee.objects.filter(tab_number='001').delete()