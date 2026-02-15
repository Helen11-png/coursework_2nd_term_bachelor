from django.db import models

class Employee(models.Model):
    # employees (tab_no, fio, dept, position)
    tab_number = models.CharField(max_length=20, unique=True)
    full_name = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    position = models.CharField(max_length=100)

    # Начальник, null=True значит, что у директора начальника может не быть
    manager = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.full_name} ({self.tab_number})"