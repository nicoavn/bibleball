from django.contrib import admin
from game import models


@admin.register(models.Question)
class QuestionAdmin(admin.ModelAdmin):
    ...


@admin.register(models.Answer)
class AnswerAdmin(admin.ModelAdmin):
    ...


@admin.register(models.Pack)
class PackAdmin(admin.ModelAdmin):
    ...


@admin.register(models.QuestionPack)
class QuestionPackAdmin(admin.ModelAdmin):
    list_filter = ("pack",)
    list_display = ("pack__name", "question__question", "created_at")


@admin.register(models.Team)
class TeamAdmin(admin.ModelAdmin):
    ...


@admin.register(models.Member)
class MemberAdmin(admin.ModelAdmin):
    ...


@admin.register(models.GameEvent)
class GameEventAdmin(admin.ModelAdmin):
    ...


@admin.register(models.Game)
class GameAdmin(admin.ModelAdmin):
    class Meta:
        verbose_name = "Game"
        verbose_name_plural = "Games"


@admin.register(models.TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    ...


@admin.register(models.Inning)
class InningAdmin(admin.ModelAdmin):
    ...
