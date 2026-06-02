import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('leaves', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # Add TL approval fields
        migrations.AddField(
            model_name='leaverequest',
            name='tl_approved_by',
            field=models.ForeignKey(
                blank=True, null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='tl_approved_leaves',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name='leaverequest',
            name='tl_approved_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='leaverequest',
            name='approved_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        # Update status choices to include TL_Approved
        migrations.AlterField(
            model_name='leaverequest',
            name='status',
            field=models.CharField(
                choices=[
                    ('Pending', 'Pending'),
                    ('TL_Approved', 'TL Approved'),
                    ('Approved', 'Approved'),
                    ('Rejected', 'Rejected'),
                    ('Cancelled', 'Cancelled'),
                ],
                default='Pending',
                max_length=15,
            ),
        ),
    ]
