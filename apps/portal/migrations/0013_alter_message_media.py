# Generated by Django 4.2.1 on 2023-07-08 19:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('portal', '0012_message_media'),
    ]

    operations = [
        migrations.AlterField(
            model_name='message',
            name='media',
            field=models.CharField(blank=True, default='[]', max_length=1000, null=True),
        ),
    ]
