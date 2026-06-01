from django.urls import path
from .views import (
    EmployeeBalanceView, ApplyLeaveView, EmployeeLeaveListView, CancelLeaveView,
    ManagerLeaveListView, ApproveLeaveView, RejectLeaveView, ManagerBalancesView
)

urlpatterns = [
    # Employee Endpoints
    path('employee/balance/', EmployeeBalanceView.as_view(), name='employee_balance'),
    path('employee/apply-leave/', ApplyLeaveView.as_view(), name='employee_apply_leave'),
    path('employee/leaves/', EmployeeLeaveListView.as_view(), name='employee_leaves'),
    path('employee/cancel/<int:pk>/', CancelLeaveView.as_view(), name='employee_cancel_leave'),

    # Manager Endpoints
    path('manager/leaves/', ManagerLeaveListView.as_view(), name='manager_leaves'),
    path('manager/approve/<int:pk>/', ApproveLeaveView.as_view(), name='manager_approve_leave'),
    path('manager/reject/<int:pk>/', RejectLeaveView.as_view(), name='manager_reject_leave'),
    path('manager/balances/', ManagerBalancesView.as_view(), name='manager_balances'),
]
