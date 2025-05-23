# Generated by Django 5.1.5 on 2025-04-17 01:11

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("game", "0008_alter_questionpack_unique_together"),
    ]

    operations = [
        migrations.AlterField(
            model_name="member",
            name="position",
            field=models.CharField(
                blank=True,
                choices=[
                    ("P", "Pitcher"),
                    ("1B", "First Base"),
                    ("2B", "Second Base"),
                    ("3B", "Third Base"),
                    ("SS", "Shortstop"),
                    ("C", "Catcher"),
                    ("LF", "Left Field"),
                    ("CF", "Center Field"),
                    ("RF", "Right Field"),
                    ("DH", "Designated Hitter"),
                ],
                max_length=2,
                null=True,
            ),
        ),
    ]
