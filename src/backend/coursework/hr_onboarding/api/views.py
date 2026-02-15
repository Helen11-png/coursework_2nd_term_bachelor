from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from employees.models import Employee
from api.models import Request
from .serializers import EmployeeSerializer, RequestSerializer
from django.http import HttpResponse

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
        serializer = RequestSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
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