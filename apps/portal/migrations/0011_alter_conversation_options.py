# Generated by Django 4.2.1 on 2023-07-08 11:35

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('portal', '0010_contact_is_blocked'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='conversation',
            options={'ordering': ['-last_message_time', '-updated_at', '-created_at']},
        ),
    ]
