# Generated by Django 4.2.1 on 2024-09-11 18:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('portal', '0015_alter_phonenumber_unique_together_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='phonenumber',
            name='phone_number',
            field=models.CharField(max_length=20),
        ),
    ]
