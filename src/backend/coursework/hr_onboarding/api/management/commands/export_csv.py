import csv
from django.core.management.base import BaseCommand
from django.db.models import OuterRef, Subquery, Avg, F, Q
from employees.models import Employee
from api.models import Request, Route, ApprovalStep
from datetime import datetime
from django.utils import timezone
import json


class Command(BaseCommand):
    help = 'Export data to CSV and JSON files for 1C'

    def handle(self, *args, **options):
        # ===== CSV EXPORT =====
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

        with open('../../../../data/requests.csv', 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow([
                'req_id', 'tab_no', 'type', 'status', 'created_at', 'approved_at',
                'route_type', 'current_step', 'current_approver_tab', 'is_overdue'
            ])
            for req in Request.objects.all():
                writer.writerow([
                    req.id,
                    req.employee.tab_number,
                    req.request_type,
                    req.status,
                    req.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                    req.approved_at.strftime('%Y-%m-%d %H:%M:%S') if req.approved_at else '',
                    req.request_type,
                    '',
                    '',
                    'N'
                ])

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

        # ===== JSON EXPORT (ВНУТРИ handle, с правильным отступом!) =====
        # 1. employees.json
        employees_data = []
        for emp in Employee.objects.all():
            employees_data.append({
                "model": "employees.employee",
                "pk": emp.id,
                "fields": {
                    "tab_number": emp.tab_number,
                    "full_name": emp.full_name,
                    "department": emp.department,
                    "position": emp.position,
                    "role": emp.role,
                    "manager": emp.manager.id if emp.manager else None
                }
            })
        with open('../../../../data/employees.json', 'w', encoding='utf-8') as f:
            json.dump(employees_data, f, ensure_ascii=False, indent=2)

        # 2. requests.json
        requests_data = []
        for req in Request.objects.all():
            requests_data.append({
                "id": req.id,
                "employee_tab_number": req.employee.tab_number,
                "type": req.request_type,
                "status": req.status,
                "created_at": req.created_at.isoformat() if req.created_at else None,
                "approved_at": req.approved_at.isoformat() if req.approved_at else None,
                "start_date": req.start_date.isoformat() if req.start_date else None,
                "end_date": req.end_date.isoformat() if req.end_date else None,
                "comment": req.comment,
                "rejection_comment": req.rejection_comment
            })
        with open('../../../../data/requests.json', 'w', encoding='utf-8') as f:
            json.dump(requests_data, f, ensure_ascii=False, indent=2)

        # 3. routes.json
        routes_data = list(Route.objects.values(
            'request_type', 'step_number', 'role', 'sla_days'
        ))
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
                "assigned_at": step.assigned_at.isoformat() if step.assigned_at else None,
                "acted_at": step.acted_at.isoformat() if step.acted_at else None,
                "comment": step.comment,
                "sla_days": step.sla_days,
                "duration_days": round((step.acted_at - step.assigned_at).total_seconds() / 86400,
                                       2) if step.acted_at and step.assigned_at else None,
                "is_overdue": (
                                          timezone.now() - step.assigned_at).total_seconds() / 86400 > step.sla_days if step.assigned_at and step.sla_days and not step.acted_at else False
            })
        with open('../../../../data/approval_steps.json', 'w', encoding='utf-8') as f:
            json.dump(steps_data, f, ensure_ascii=False, indent=2)

        self.stdout.write(self.style.SUCCESS('CSV и JSON файлы созданы в /data'))

    def generate_summary_report(self):
        with open('../../../../data/kpi_summary.csv', 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow([
                'metric_name',
                'value',
                'unit',
                'period'
            ])
            total_requests = Request.objects.count()
            approved_requests = Request.objects.filter(status='approved').count()
            avg_duration = Request.objects.filter(
                status='approved',
                approved_at__isnull=False
            ).annotate(
                duration=F('approved_at') - F('created_at')
            ).aggregate(avg=Avg('duration'))['avg']
            if avg_duration:
                avg_duration_days = avg_duration.total_seconds() / 86400
                writer.writerow(['avg_approval_days', round(avg_duration_days, 2), 'days', 'all_time'])
            writer.writerow(['total_requests', total_requests, 'count', 'all_time'])
            writer.writerow(['approved_requests', approved_requests, 'count', 'all_time'])
            for req_type in ['vacation', 'business_trip']:
                count = Request.objects.filter(request_type=req_type).count()
                writer.writerow([f'{req_type}_requests', count, 'count', 'all_time'])