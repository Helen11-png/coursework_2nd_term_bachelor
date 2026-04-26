from django.db import models
from employees.models import Employee


class Request(models.Model):
    # requests (req_id, tab_no, type, status, created_at, approved_at)
    REQUEST_TYPES = [
        ('vacation', 'Отпуск'),
        ('business_trip', 'Командировка'),
    ]
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    comment = models.TextField(blank=True)
    rejection_comment = models.TextField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)
    STATUSES = [
        ('draft', 'Черновик'),
        ('submitted', 'Отправлено'),
        ('pending', 'На рассмотрении'),
        ('in_approval', 'На согласовании'),
        ('approved', 'Утверждено'),
        ('rejected', 'Отклонено'),
    ]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    request_type = models.CharField(max_length=20, choices=REQUEST_TYPES)
    status = models.CharField(max_length=20, choices=STATUSES, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Заявка {self.id} от {self.employee.full_name}"

    def create_approval_steps(self):
        # Получаем все шаги маршрута для этого типа заявки
        routes=Route.objects.filter(request_type=self.request_type).order_by('step_number')
        for route in routes:
            ApprovalStep.objects.create(
                request=self,
                step_number=route.step_number,
                role=route.role,
                sla_days=route.sla_days,
                status='pending'
            )


class Route(models.Model):
    ROLES = [
        ('manager', 'Руководитель'),
        ('hr', 'HR-специалист'),
    ]

    request_type = models.CharField(max_length=20, choices=Request.REQUEST_TYPES)
    step_number = models.IntegerField()
    role = models.CharField(max_length=20, choices=ROLES)
    sla_days = models.IntegerField()

    class Meta:
        unique_together = ['request_type', 'step_number']

    def __str__(self):
        return f"{self.request_type} - шаг {self.step_number}: {self.role}"


class ApprovalHistory(models.Model):
    DECISIONS = [
        ('pending', 'Ожидает'),
        ('approved', 'Утверждено'),
        ('rejected', 'Отклонено'),
    ]
    request = models.ForeignKey(Request, on_delete=models.CASCADE, related_name='history')
    step_number = models.IntegerField()
    role = models.CharField(max_length=20, choices=Route.ROLES)
    decision = models.CharField(max_length=20, choices=DECISIONS, default='pending')
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    decided_by = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True)
    class Meta:
        ordering = ['request', 'step_number']

    def __str__(self):
        return f"{self.request} - шаг {self.step_number}: {self.decision}"


class ApprovalStep(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Ожидает'),
        ('approved', 'Утверждено'),
        ('rejected', 'Отклонено'),
    ]

    request = models.ForeignKey(Request, on_delete=models.CASCADE, related_name='steps')
    step_number = models.IntegerField()
    role = models.CharField(max_length=50)  # manager, hr
    approver = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    assigned_at = models.DateTimeField(auto_now_add=True)
    acted_at = models.DateTimeField(null=True, blank=True)
    comment = models.TextField(blank=True)
    sla_days = models.IntegerField(default=1)

    class Meta:
        ordering = ['request', 'step_number']
        unique_together = ['request', 'step_number']