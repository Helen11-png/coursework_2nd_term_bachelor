from django.contrib import admin
from .models import Request, Route, ApprovalStep

class ApprovalStepInline(admin.TabularInline):
    model=ApprovalStep
    extra=0
    readonly_fields=['assigned_at', 'acted_at']
@admin.register(Request)
class RequestAdmin(admin.ModelAdmin):
    list_display=['id', 'employee', 'request_type', 'status', 'created_at']
    list_filter=['request_type', 'status']
    search_fields=['employee__full_name', 'employee__tab_number']
    inlines=[ApprovalStepInline]
@admin.register(ApprovalStep)
class ApprovalStepAdmin(admin.ModelAdmin):
    list_display=['request', 'step_number', 'role', 'status', 'assigned_at']
    list_filter=['status', 'role']
    search_fields=['request__employee__full_name']
@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display=['request_type', 'step_number', 'role', 'sla_days']
    list_filter=['request_type', 'role']