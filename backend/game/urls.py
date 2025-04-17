from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("start", views.start_game, name="start_game"),
    path("pitch", views.pitch_question, name="pitch_question"),
    path("check-answer", views.check_answer, name="check_answer"),
    path("next-hitter", views.get_next_hitter, name="get_next_hitter"),
    path("board", views.get_game_board, name="get_game_board"),
    path("packs", views.get_packs, name="get_packs"),
]
