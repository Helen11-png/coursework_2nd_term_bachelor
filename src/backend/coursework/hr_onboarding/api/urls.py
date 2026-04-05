from django.urls import path
from . import views

urlpatterns = [
    path('employees/', views.employee_list),
    path('requests/', views.request_list),
    path('my-requests/', views.my_requests, name='my_requests'),
    path('manager-requests/', views.manager_requests),
    path('hr-requests/', views.hr_requests),
    path('requests/<int:pk>/approve/', views.approve_request),
    path('requests/<int:pk>/reject/', views.reject_request),
    path('requests/<int:pk>/', views.request_detail),
    path('login/', views.login, name='login'),
]