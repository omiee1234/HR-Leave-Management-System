from django.contrib import admin
from .models import LeaveBalance, LeaveRequest

@admin.register(LeaveBalance)
class LeaveBalanceAdmin(admin.ModelAdmin):
    list_display = ('user', 'vacation_balance', 'sick_balance', 'casual_balance')
    search_fields = ('user__email', 'user__name')

@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ('employee', 'leave_type', 'start_date', 'end_date', 'total_days', 'status', 'applied_at')
    list_filter = ('status', 'leave_type', 'start_date')
    search_fields = ('employee__email', 'employee__name', 'reason')
