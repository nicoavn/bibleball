# Generated by Django 5.1.5 on 2025-01-25 15:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0002_remove_game_question_pack_answer_created_at_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='game',
            name='total_innings',
            field=models.IntegerField(default=9),
        ),
    ]
