# Generated by Django 5.1.5 on 2025-01-26 21:27

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("game", "0005_alter_inning_options"),
    ]

    operations = [
        migrations.AddField(
            model_name="gameevent",
            name="question",
            field=models.ForeignKey(
                default=None,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="events",
                to="game.question",
            ),
            preserve_default=False,
        ),
    ]
