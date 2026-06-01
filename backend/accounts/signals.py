from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from leaves.models import LeaveBalance

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_leave_balance(sender, instance, created, **kwargs):
    """
    Signal receiver that creates a LeaveBalance object with standard defaults
    (12 Vacation, 8 Sick, 6 Casual) when a User with 'employee' role is created.
    """
    if created and instance.role == 'employee':
        LeaveBalance.objects.create(user=instance)
