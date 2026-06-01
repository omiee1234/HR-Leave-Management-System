from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from .models import LeaveBalance, LeaveRequest
from .serializers import LeaveBalanceSerializer, LeaveRequestSerializer
from .permissions import IsEmployee, IsManager

# ==========================================
# EMPLOYEE API VIEWS
# ==========================================

class EmployeeBalanceView(APIView):
    """
    GET /api/employee/balance/
    Fetches the leave balance for the currently logged-in Employee.
    """
    permission_classes = [IsEmployee]

    def get(self, request):
        try:
            balance = LeaveBalance.objects.get(user=request.user)
            serializer = LeaveBalanceSerializer(balance)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except LeaveBalance.DoesNotExist:
            return Response({"error": "Leave balance record not found."}, status=status.HTTP_404_NOT_FOUND)

class ApplyLeaveView(APIView):
    """
    POST /api/employee/apply-leave/
    Submits a new leave request. Performs all system validation via LeaveRequestSerializer.
    """
    permission_classes = [IsEmployee]

    def post(self, request):
        serializer = LeaveRequestSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EmployeeLeaveListView(APIView):
    """
    GET /api/employee/leaves/
    Fetches all leave requests submitted by the logged-in Employee.
    """
    permission_classes = [IsEmployee]

    def get(self, request):
        leaves = LeaveRequest.objects.filter(employee=request.user).order_by('-applied_at')
        serializer = LeaveRequestSerializer(leaves, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CancelLeaveView(APIView):
    """
    PUT /api/employee/cancel/<id>/
    Cancels a pending leave request. Approved or rejected requests cannot be cancelled.
    """
    permission_classes = [IsEmployee]

    def put(self, request, pk):
        try:
            leave = LeaveRequest.objects.get(pk=pk, employee=request.user)
        except LeaveRequest.DoesNotExist:
            return Response({"error": "Leave request not found."}, status=status.HTTP_404_NOT_FOUND)

        if leave.status != 'Pending':
            return Response({"error": "Only pending leave requests can be cancelled."}, status=status.HTTP_400_BAD_REQUEST)

        leave.status = 'Cancelled'
        leave.save()
        serializer = LeaveRequestSerializer(leave)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ==========================================
# MANAGER API VIEWS
# ==========================================

class ManagerLeaveListView(APIView):
    """
    GET /api/manager/leaves/
    Fetches all leave requests across the system for review by a Manager.
    """
    permission_classes = [IsManager]

    def get(self, request):
        leaves = LeaveRequest.objects.all().order_by('-applied_at')
        serializer = LeaveRequestSerializer(leaves, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ApproveLeaveView(APIView):
    """
    PUT /api/manager/approve/<id>/
    Approves a pending leave request and automatically deducts the calculated days from the employee's balance.
    Atomic locking ensures concurrent stability.
    """
    permission_classes = [IsManager]

    def put(self, request, pk):
        try:
            leave = LeaveRequest.objects.get(pk=pk)
        except LeaveRequest.DoesNotExist:
            return Response({"error": "Leave request not found."}, status=status.HTTP_404_NOT_FOUND)

        if leave.status != 'Pending':
            return Response({"error": "Only pending leave requests can be approved."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                # Acquire database row lock on the user's leave balance to prevent concurrent updates
                balance = LeaveBalance.objects.select_for_update().get(user=leave.employee)

                # Final validation before deducting balance
                if leave.leave_type == 'vacation':
                    if balance.vacation_balance < leave.total_days:
                        return Response({"error": "Insufficient vacation balance to approve."}, status=status.HTTP_400_BAD_REQUEST)
                    balance.vacation_balance -= leave.total_days
                elif leave.leave_type == 'sick':
                    if balance.sick_balance < leave.total_days:
                        return Response({"error": "Insufficient sick balance to approve."}, status=status.HTTP_400_BAD_REQUEST)
                    balance.sick_balance -= leave.total_days
                elif leave.leave_type == 'casual':
                    if balance.casual_balance < leave.total_days:
                        return Response({"error": "Insufficient casual balance to approve."}, status=status.HTTP_400_BAD_REQUEST)
                    balance.casual_balance -= leave.total_days
                else:
                    return Response({"error": "Invalid leave type in request."}, status=status.HTTP_400_BAD_REQUEST)

                balance.save()
                leave.status = 'Approved'
                leave.approved_by = request.user
                leave.save()

        except LeaveBalance.DoesNotExist:
            return Response({"error": "Leave balance record not found for this employee."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        serializer = LeaveRequestSerializer(leave)
        return Response(serializer.data, status=status.HTTP_200_OK)

class RejectLeaveView(APIView):
    """
    PUT /api/manager/reject/<id>/
    Rejects a pending leave request. Requires a 'rejection_reason'.
    """
    permission_classes = [IsManager]

    def put(self, request, pk):
        try:
            leave = LeaveRequest.objects.get(pk=pk)
        except LeaveRequest.DoesNotExist:
            return Response({"error": "Leave request not found."}, status=status.HTTP_404_NOT_FOUND)

        if leave.status != 'Pending':
            return Response({"error": "Only pending leave requests can be rejected."}, status=status.HTTP_400_BAD_REQUEST)

        rejection_reason = request.data.get('rejection_reason')
        if not rejection_reason or rejection_reason.strip() == "":
            return Response({"rejection_reason": ["Rejection reason is required."]}, status=status.HTTP_400_BAD_REQUEST)

        leave.status = 'Rejected'
        leave.rejection_reason = rejection_reason.strip()
        leave.approved_by = request.user
        leave.save()

        serializer = LeaveRequestSerializer(leave)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ManagerBalancesView(APIView):
    """
    GET /api/manager/balances/
    Fetches all employee leave balances.
    """
    permission_classes = [IsManager]

    def get(self, request):
        balances = LeaveBalance.objects.all().order_by('user__name')
        serializer = LeaveBalanceSerializer(balances, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
