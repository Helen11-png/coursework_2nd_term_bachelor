from django.core.management.base import BaseCommand
from employees.models import Employee
from api.models import Request, Route, ApprovalStep


class Command(BaseCommand):
    def handle(self, *args, **options):
        import os
        self.stdout.write("🔍 Проверка путей:")
        self.stdout.write(f"Текущая папка: {os.getcwd()}")

        # Создаем папку data
        root_data = os.path.join(os.path.dirname(
            os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))), 'data')
        os.makedirs(root_data, exist_ok=True)
        self.stdout.write(f"✅ Папка data: {root_data}")

        # ===== СОТРУДНИКИ =====
        employee1, created1 = Employee.objects.get_or_create(
            tab_number='001',
            defaults={
                'full_name': 'Иван Иванов',
                'department': 'IT',
                'position': 'Разработчик',
                'role': 'employee'
            }
        )

        employee2, created2 = Employee.objects.get_or_create(
            tab_number='002',
            defaults={
                'full_name': 'Петр Петров',
                'department': 'Sales',
                'position': 'Менеджер по продажам',
                'role': 'employee'
            }
        )

        employee3, created3 = Employee.objects.get_or_create(
            tab_number='003',
            defaults={
                'full_name': 'Мария Сидорова',
                'department': 'HR',
                'position': 'HR-специалист',
                'role': 'hr'
            }
        )

        # ===== РУКОВОДИТЕЛИ =====
        # IT отдел
        it_manager, created_it = Employee.objects.get_or_create(
            tab_number='010',
            defaults={
                'full_name': 'Петр Сидоров',
                'department': 'IT',
                'position': 'Руководитель IT',
                'role': 'manager'
            }
        )

        # Sales отдел
        sales_manager, created_sales = Employee.objects.get_or_create(
            tab_number='020',
            defaults={
                'full_name': 'Ольга Лебедева',
                'department': 'Sales',
                'position': 'Руководитель Sales',
                'role': 'manager'
            }
        )

        # HR отдел
        hr_manager, created_hr = Employee.objects.get_or_create(
            tab_number='030',
            defaults={
                'full_name': 'Анна Волкова',
                'department': 'Административный отдел',
                'position': 'Руководитель административного отдела',
                'role': 'manager'
            }
        )

        # ===== НАЗНАЧАЕМ РУКОВОДИТЕЛЕЙ =====
        # Иван Иванов (IT) → подчиняется Петру Сидорову
        employee1.manager = it_manager
        employee1.save()
        self.stdout.write(f"✅ {employee1.full_name} → {it_manager.full_name}")

        # Петр Петров (Sales) → подчиняется Ольге Менеджер
        employee2.manager = sales_manager
        employee2.save()
        self.stdout.write(f"✅ {employee2.full_name} → {sales_manager.full_name}")

        # Мария Сидорова (HR) → подчиняется Анне HR-руководитель
        employee3.manager = hr_manager
        employee3.save()
        self.stdout.write(f"✅ {employee3.full_name} → {hr_manager.full_name}")

        # ===== МАРШРУТЫ =====
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

        # ===== ЗАЯВКИ =====
        req1 = Request.objects.create(
            employee=employee1,
            request_type='vacation',
            status='submitted'
        )
        req1.create_approval_steps()
        self.stdout.write(f"✅ Создана заявка #{req1.id} (отпуск, {employee1.full_name})")

        req2 = Request.objects.create(
            employee=employee2,
            request_type='business_trip',
            status='submitted'
        )
        req2.create_approval_steps()
        self.stdout.write(f"✅ Создана заявка #{req2.id} (командировка, {employee2.full_name})")

        req3 = Request.objects.create(
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
        self.stdout.write(f"✅ Создана заявка #{req3.id} (одобренный отпуск, {employee3.full_name})")

        self.stdout.write(self.style.SUCCESS('✅ Тестовые данные успешно созданы!'))