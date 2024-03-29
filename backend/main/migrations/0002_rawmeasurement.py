# Generated by Django 4.0.3 on 2022-03-30 20:19

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='RawMeasurement',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_on', models.DateTimeField(auto_now_add=True)),
                ('modified_on', models.DateTimeField(auto_now=True)),
                ('value', models.FloatField()),
                ('measurement', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='raw_values', to='main.measurement')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
