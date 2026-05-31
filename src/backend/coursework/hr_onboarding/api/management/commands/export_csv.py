import csv
from django.core.management.base import BaseCommand
from django.db.models import Avg, F
from employees.models import Employee
from api.models import Request, Route, ApprovalStep
from django.utils import timezone
import json


class Command(BaseCommand):
    help = 'Export data to CSV and JSON files for 1C'

    def handle(self, *args, **options):
        # ===== CSV EXPORT =====
        # 1. employees.csv
        with open('../../../../data/employees.csv', 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['tab_number', 'full_name', 'department', 'position', 'manager_tab_number'])
            for emp in Employee.objects.all():
                writer.writerow([
                    emp.tab_number,
                    emp.full_name,
                    emp.department,
                    emp.position,
                    emp.manager.tab_number if emp.manager else ''
                ])

        # 2. requests.csv
        with open('../../../../data/requests.csv', 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow([
                'req_id', 'tab_no', 'type', 'status', 'created_at', 'approved_at',
                'start_date', 'end_date', 'comment', 'is_overdue'
            ])
            for req in Request.objects.all():
                # Берём комментарий: если есть rejection_comment — его, иначе обычный comment
                comment_text = req.rejection_comment or req.comment or ''

                writer.writerow([
                    req.id,
                    req.employee.tab_number,
                    req.request_type,
                    req.status,
                    req.created_at.strftime('%d.%m.%Y') if req.created_at else '',
                    req.approved_at.strftime('%d.%m.%Y') if req.approved_at else '',
                    req.start_date.strftime('%d.%m.%Y') if req.start_date else '',
                    req.end_date.strftime('%d.%m.%Y') if req.end_date else '',
                    comment_text,
                    'Нет'
                ])

        # 3. routes.csv
        with open('../../../../data/routes.csv', 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['type', 'step_no', 'role', 'sla_days', 'step_description'])
            for route in Route.objects.all():
                writer.writerow([
                    route.request_type,
                    route.step_number,
                    route.role,
                    route.sla_days,
                    f"Шаг {route.step_number}: {route.role}"
                ])

        # 4. approval_steps.csv
        with open('../../../../data/approval_steps.csv', 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow([
                'step_id', 'req_id', 'step_number', 'role', 'approver_tab_no',
                'status', 'assigned_at', 'acted_at', 'comment', 'sla_days',
                'duration_days', 'is_overdue'
            ])
            for step in ApprovalStep.objects.all().select_related('request', 'approver'):
                duration = None
                if step.acted_at and step.assigned_at:
                    duration = (step.acted_at - step.assigned_at).total_seconds() / 86400
                is_overdue = False
                if step.acted_at and step.assigned_at and step.sla_days:
                    is_overdue = duration > step.sla_days
                elif not step.acted_at and step.assigned_at and step.sla_days:
                    days_passed = (timezone.now() - step.assigned_at).total_seconds() / 86400
                    is_overdue = days_passed > step.sla_days
                writer.writerow([
                    step.id,
                    step.request.id,
                    step.step_number,
                    step.role,
                    step.approver.tab_number if step.approver else '',
                    step.status,
                    step.assigned_at.strftime('%Y-%m-%d %H:%M:%S') if step.assigned_at else '',
                    step.acted_at.strftime('%Y-%m-%d %H:%M:%S') if step.acted_at else '',
                    step.comment or '',
                    step.sla_days or '',
                    round(duration, 2) if duration is not None else '',
                    'Y' if is_overdue else 'N'
                ])

        self.generate_summary_report()

        # ===== JSON EXPORT =====
        # 1. employees.json
        employees_data = []
        for emp in Employee.objects.all():
            employees_data.append({
                "tab_number": emp.tab_number,
                "full_name": emp.full_name,
                "department": emp.department,
                "position": emp.position,
                "role": emp.role,
                "manager_tab_number": emp.manager.tab_number if emp.manager else None
            })
        with open('../../../../data/employees.json', 'w', encoding='utf-8') as f:
            json.dump(employees_data, f, ensure_ascii=False, indent=2)

        # 2. requests.json
        def get_comment(req):
            if req.rejection_comment:
                return req.rejection_comment
            return req.comment or ''

        requests_data = []
        for req in Request.objects.all():
            requests_data.append({
                "id": req.id,
                "employee_tab_number": req.employee.tab_number,
                "employee_name": req.employee.full_name,
                "type": req.request_type,
                "status": req.status,
                "created_at": req.created_at.strftime('%d.%m.%Y %H:%M:%S') if req.created_at else '',
                "approved_at": req.approved_at.strftime('%d.%m.%Y') if req.approved_at else '',
                "start_date": req.start_date.strftime('%d.%m.%Y') if req.start_date else '',
                "end_date": req.end_date.strftime('%d.%m.%Y') if req.end_date else '',
                "comment": get_comment(req)  # ← объединённый комментарий
            })
        with open('../../../../data/requests.json', 'w', encoding='utf-8') as f:
            json.dump(requests_data, f, ensure_ascii=False, indent=2)

        # 3. routes.json
        routes_data = list(Route.objects.values('request_type', 'step_number', 'role', 'sla_days'))
        with open('../../../../data/routes.json', 'w', encoding='utf-8') as f:
            json.dump(routes_data, f, ensure_ascii=False, indent=2)

        # 4. approval_steps.json
        steps_data = []
        for step in ApprovalStep.objects.all().select_related('request', 'approver'):
            steps_data.append({
                "id": step.id,
                "request_id": step.request.id,
                "step_number": step.step_number,
                "role": step.role,
                "approver_tab_number": step.approver.tab_number if step.approver else None,
                "status": step.status,
                "assigned_at": step.assigned_at.strftime('%d.%m.%Y %H:%M:%S') if step.assigned_at else '',
                "acted_at": step.acted_at.strftime('%d.%m.%Y %H:%M:%S') if step.acted_at else '',
                "comment": step.comment or '',
                "sla_days": step.sla_days,
                "duration_days": round((step.acted_at - step.assigned_at).total_seconds() / 86400,
                                       2) if step.acted_at and step.assigned_at else None
            })
        with open('../../../../data/approval_steps.json', 'w', encoding='utf-8') as f:
            json.dump(steps_data, f, ensure_ascii=False, indent=2)

        self.stdout.write(self.style.SUCCESS('CSV и JSON файлы созданы в /data'))

    def generate_summary_report(self):
        with open('../../../../data/kpi_summary.csv', 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['metric_name', 'value', 'unit', 'period'])

            total_requests = Request.objects.count()
            approved_requests = Request.objects.filter(status='approved').count()

            avg_duration = Request.objects.filter(
                status='approved', approved_at__isnull=False
            ).annotate(duration=F('approved_at') - F('created_at')).aggregate(avg=Avg('duration'))['avg']

            if avg_duration:
                avg_duration_days = avg_duration.total_seconds() / 86400
                writer.writerow(['avg_approval_days', round(avg_duration_days, 2), 'days', 'all_time'])

            writer.writerow(['total_requests', total_requests, 'count', 'all_time'])
            writer.writerow(['approved_requests', approved_requests, 'count', 'all_time'])

            for req_type in ['vacation', 'business_trip']:
                count = Request.objects.filter(request_type=req_type).count()
                writer.writerow([f'{req_type}_requests', count, 'count', 'all_time'])