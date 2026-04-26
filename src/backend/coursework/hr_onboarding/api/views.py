from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from employees.models import Employee
from api.models import Request
from .serializers import EmployeeSerializer, RequestSerializer
from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

def home(request):
    return HttpResponse("""
        <h1>HR Onboarding API</h1>
        <p>Доступные адреса:</p>
        <ul>
            <li><a href="/api/employees/">/api/employees/</a> - сотрудники</li>
            <li><a href="/api/requests/">/api/requests/</a> - заявки</li>
            <li><a href="/admin/">/admin/</a> - админка</li>
        </ul>
    """)

@api_view(['GET', 'POST'])
def employee_list(request):
    if request.method == 'GET':
        employees = Employee.objects.all()
        serializer = EmployeeSerializer(employees, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = EmployeeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
def request_list(request):
    if request.method == 'GET':
        requests = Request.objects.all()
        serializer = RequestSerializer(requests, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        print("📨 Получены данные:", request.data)

        data = request.data
        employee_id = data.get('employee')

        # Получаем сотрудника
        try:
            employee = Employee.objects.get(id=employee_id)
        except Employee.DoesNotExist:
            return Response({'error': 'Сотрудник не найден'}, status=404)

        # Определяем начальный статус
        if employee.role == 'manager' and not employee.manager:
            initial_status = 'in_approval'
            print(f"👔 Руководитель {employee.full_name} без начальника → заявка сразу HR")
        else:
            initial_status = 'submitted'

        # Определяем тип заявки
        request_type_raw = data.get('request_type') or data.get('requestType')

        if request_type_raw in ('mission', 'business_trip'):
            request_type = 'business_trip'
        elif request_type_raw == 'vacation':
            request_type = 'vacation'
        else:
            request_type = 'vacation'

        adapted_data = {
            'employee': employee_id,
            'request_type': request_type,
            'status': initial_status,
            'start_date': data.get('start_date') or data.get('startDate'),
            'end_date': data.get('end_date') or data.get('endDate'),
            'comment': data.get('comment', '')
        }

        print("🔄 Адаптированные данные:", adapted_data)

        serializer = RequestSerializer(data=adapted_data)
        if serializer.is_valid():
            request_obj = serializer.save()
            request_obj.create_approval_steps()

            # Если заявка сразу уходит HR, пропускаем шаг руководителя
            if initial_status == 'in_approval':
                manager_step = request_obj.steps.filter(step_number=1, role='manager').first()
                if manager_step:
                    manager_step.status = 'approved'
                    manager_step.acted_at = timezone.now()
                    manager_step.comment = 'Автоматически (руководитель без начальника)'
                    manager_step.save()
                    print(f"✅ Шаг руководителя автоматически одобрен")

            print("✅ Заявка создана!")
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        print("❌ Ошибки валидации:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def request_detail(request, pk):
    try:
        req = Request.objects.get(pk=pk)
    except Request.DoesNotExist:
        return Response({'error': 'Заявка не найдена'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        serializer = RequestSerializer(req)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = RequestSerializer(req, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        req.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def my_requests(request):
    """Получить заявки текущего сотрудника"""
    employee_id = request.GET.get('employee_id', 1)
    try:
        employee_id = int(employee_id)
    except ValueError:
        return Response({'error': 'Invalid employee_id'}, status=400)
    requests_list = Request.objects.filter(employee_id=employee_id)
    serializer = RequestSerializer(requests_list, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def manager_requests(request):
    """Получить заявки для руководителя (ожидают утверждения)"""
    manager_id = request.GET.get('manager_id', 1)

    try:
        manager_id = int(manager_id)
    except ValueError:
        return Response({'error': 'Invalid manager_id'}, status=400)

    # Находим всех сотрудников у этого руководителя
    subordinates = Employee.objects.filter(manager_id=manager_id)

    # Заявки со статусом 'submitted' (ждут руководителя)
    requests_list = Request.objects.filter(
        employee__in=subordinates,
        status='submitted'  # ← ключевой статус!
    )

    serializer = RequestSerializer(requests_list, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def hr_requests(request):
    """Получить заявки для HR (уже утвержденные руководителем)"""
    # Заявки со статусом 'in_approval' (ждут HR)
    requests_list = Request.objects.filter(status='in_approval')
    serializer = RequestSerializer(requests_list, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def approve_request(request, pk):
    try:
        req = Request.objects.get(pk=pk)
    except Request.DoesNotExist:
        return Response({'error': 'Заявка не найдена'}, status=404)

    role = request.data.get('role', 'manager')
    print(f"✅ Утверждение заявки {pk}, роль: {role}")
    print(
        f"👤 Сотрудник: {req.employee.full_name}, роль сотрудника: {req.employee.role}, есть менеджер: {req.employee.manager is not None}")

    # ОСОБЫЙ СЛУЧАЙ: Если заявка от руководителя без начальника
    if req.employee.role == 'manager' and not req.employee.manager:
        print("👔 Руководитель без начальника, заявка сразу в HR")
        req.status = 'in_approval'
        req.save()

        # Обновляем шаг руководителя как автоматически пройденный
        manager_step = req.steps.filter(step_number=1, role='manager').first()
        if manager_step:
            manager_step.status = 'approved'
            manager_step.acted_at = timezone.now()
            manager_step.comment = 'Автоматически (руководитель без начальника)'
            manager_step.save()

        return Response({'status': 'ok', 'message': 'Заявка отправлена HR'})

    # Обычный случай: утверждение руководителем или HR
    if role == 'manager':
        # Руководитель утвердил → отправляем HR
        req.status = 'in_approval'
        req.save()

        # Обновляем шаг руководителя
        manager_step = req.steps.filter(step_number=1, role='manager').first()
        if manager_step:
            manager_step.status = 'approved'
            manager_step.acted_at = timezone.now()
            manager_step.save()
        print("✅ Заявка отправлена HR")

    elif role == 'hr':
        # HR утвердил → заявка одобрена
        req.status = 'approved'
        req.approved_at = timezone.now()
        req.save()

        # Обновляем шаг HR
        hr_step = req.steps.filter(step_number=2, role='hr').first()
        if hr_step:
            hr_step.status = 'approved'
            hr_step.acted_at = timezone.now()
            hr_step.save()
        print("✅ Заявка одобрена HR")

    return Response({'status': 'ok'})

@api_view(['POST'])
def reject_request(request, pk):
    """Отклонить заявку"""
    try:
        req = Request.objects.get(pk=pk)
    except Request.DoesNotExist:
        return Response({'error': 'Заявка не найдена'}, status=404)

    req.status = 'rejected'
    req.save()

    # Обновляем текущий шаг
    current_step = req.steps.filter(status='pending').first()
    if current_step:
        current_step.status = 'rejected'
        current_step.acted_at = timezone.now()
        current_step.save()

    return Response({'status': 'ok'})


@api_view(['POST'])
def login(request):
    """Вход пользователя по табельному номеру и паролю"""
    print("📨 Данные входа:", request.data)

    tab_number = request.data.get('tab_number')
    password = request.data.get('password')

    if not tab_number:
        return Response(
            {'error': 'Табельный номер обязателен'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not password:
        return Response(
            {'error': 'Пароль обязателен'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        employee = Employee.objects.get(tab_number=tab_number)
        print(f"✅ Найден сотрудник: {employee.full_name}, роль: {employee.role}, ID: {employee.id}")
        if employee.password != password:
            print(f"❌ Неверный пароль для {employee.full_name}")
            return Response(
                {'error': 'Неверный пароль'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        response_data = {
            'id': employee.id,
            'tab_number': employee.tab_number,
            'full_name': employee.full_name,
            'department': employee.department,
            'position': employee.position,
            'role': employee.role,
            'manager_id': employee.manager.id if employee.manager else None
        }

        print("✅ Ответ:", response_data)
        return Response(response_data)

    except Employee.DoesNotExist:
        print(f"❌ Сотрудник с табельным номером {tab_number} не найден")
        return Response(
            {'error': f'Сотрудник с табельным номером {tab_number} не найден'},
            status=status.HTTP_404_NOT_FOUND
        )