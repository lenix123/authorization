# Generated by Django 3.2.1 on 2022-05-19 07:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_auto_20220518_0609'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='email_to_change',
            field=models.EmailField(blank=True, max_length=254, verbose_name='Email To Change'),
        ),
        migrations.AlterField(
            model_name='user',
            name='email',
            field=models.EmailField(max_length=254, unique=True, verbose_name='Email Address'),
        ),
    ]
