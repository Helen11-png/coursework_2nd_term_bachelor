from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('employees/', views.employee_list, name='employee_list'),
    path('requests/', views.request_list, name='request_list'),
    path('requests/<int:pk>/', views.request_detail, name='request_detail'),
]