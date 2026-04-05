from rest_framework import serializers
from employees.models import Employee
from api.models import Request, Route

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'


class RequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_department = serializers.CharField(source='employee.department', read_only=True)  # ← добавить

    class Meta:
        model = Request
        fields = ['id', 'employee', 'employee_name', 'employee_department', 'request_type',
                  'status', 'created_at', 'approved_at', 'updated_at',
                  'start_date', 'end_date', 'comment']