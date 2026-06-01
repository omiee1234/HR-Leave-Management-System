import datetime
from rest_framework import serializers
from .models import LeaveBalance, LeaveRequest
from accounts.serializers import UserSerializer

class LeaveBalanceSerializer(serializers.ModelSerializer):
    """
    Serializer to represent LeaveBalance details.
    """
    user = UserSerializer(read_only=True)

    class Meta:
        model = LeaveBalance
        fields = ('id', 'user', 'vacation_balance', 'sick_balance', 'casual_balance')
        read_only_fields = ('id', 'user')

class LeaveRequestSerializer(serializers.ModelSerializer):
    """
    Serializer to represent and validate LeaveRequests.
    All business validations are handled during the verification phase of application submission.
    """
    employee = UserSerializer(read_only=True)
    total_days = serializers.IntegerField(read_only=True)
    status = serializers.CharField(read_only=True)
    rejection_reason = serializers.CharField(read_only=True)
    approved_by = UserSerializer(read_only=True)

    class Meta:
        model = LeaveRequest
        fields = (
            'id', 'employee', 'leave_type', 'start_date', 'end_date',
            'total_days', 'reason', 'status', 'rejection_reason',
            'applied_at', 'approved_by'
        )
        read_only_fields = ('id', 'applied_at')

    def validate(self, attrs):
        request = self.context.get('request')
        if not request or not request.user:
            raise serializers.ValidationError("User authentication required.")

        employee = request.user
        leave_type = attrs.get('leave_type')
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')

        # 1. Valid date range check
        if end_date < start_date:
            raise serializers.ValidationError({"end_date": "End date cannot be before start date."})

        # 2. No past dates check
        today = datetime.date.today()
        if start_date < today:
            raise serializers.ValidationError({"start_date": "Start date cannot be in the past."})

        # 3. Automatic calculation of total days (inclusive)
        total_days = (end_date - start_date).days + 1

        # 4. Overlap check
        overlap_query = LeaveRequest.objects.filter(
            employee=employee,
            status__in=['Pending', 'Approved'],
            start_date__lte=end_date,
            end_date__gte=start_date
        )
        if self.instance:
            overlap_query = overlap_query.exclude(id=self.instance.id)

        if overlap_query.exists():
            raise serializers.ValidationError("This leave request overlaps with another pending or approved request.")

        # 5. Sufficient balance check
        try:
            balance = LeaveBalance.objects.get(user=employee)
        except LeaveBalance.DoesNotExist:
            raise serializers.ValidationError("Leave balance record not found for user.")

        if leave_type == 'vacation':
            available_balance = balance.vacation_balance
        elif leave_type == 'sick':
            available_balance = balance.sick_balance
        elif leave_type == 'casual':
            available_balance = balance.casual_balance
        else:
            raise serializers.ValidationError({"leave_type": "Invalid leave type."})

        if total_days > available_balance:
            raise serializers.ValidationError(
                f"Insufficient balance. You have {available_balance} days of {leave_type} remaining, but requested {total_days} days."
            )

        # Inject automatic attributes into serializer validated data
        attrs['total_days'] = total_days
        attrs['employee'] = employee
        return attrs
