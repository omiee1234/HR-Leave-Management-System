from django.db import models
from django.conf import settings

class LeaveBalance(models.Model):
    """
    Stores leave balances for Employees.
    Default balances: Vacation = 12, Sick = 8, Casual = 6.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='leave_balance'
    )
    vacation_balance = models.IntegerField(default=12)
    sick_balance = models.IntegerField(default=8)
    casual_balance = models.IntegerField(default=6)

    def __str__(self):
        return f"Balance for {self.user.name} - V:{self.vacation_balance}, S:{self.sick_balance}, C:{self.casual_balance}"

class LeaveRequest(models.Model):
    """
    Represents a leave request submitted by an Employee.
    """
    LEAVE_TYPE_CHOICES = (
        ('vacation', 'Vacation'),
        ('sick', 'Sick'),
        ('casual', 'Casual'),
    )

    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Cancelled', 'Cancelled'),
    )

    employee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='leave_requests'
    )
    leave_type = models.CharField(max_length=15, choices=LEAVE_TYPE_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField()
    total_days = models.IntegerField()
    reason = models.TextField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='Pending')
    rejection_reason = models.TextField(blank=True, null=True)
    applied_at = models.DateTimeField(auto_now_add=True)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_leaves'
    )

    def __str__(self):
        return f"{self.employee.name} - {self.leave_type} ({self.start_date} to {self.end_date}) [{self.status}]"
