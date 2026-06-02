from rest_framework.permissions import BasePermission

class IsEmployee(BasePermission):
    """
    Allows access only to authenticated users with the 'employee' role.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'employee'
        )

class IsManager(BasePermission):
    """
    Allows access only to authenticated users with the 'manager' role.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'manager'
        )

class IsTeamLeader(BasePermission):
    """
    Allows access only to authenticated users with the 'team_leader' role.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'team_leader'
        )
