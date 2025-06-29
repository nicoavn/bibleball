from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("start", views.start_game, name="start_game"),
    path("repeat", views.repeat_game, name="repeat_game"),
    path("pitch", views.pitch_question, name="pitch_question"),
    path("check-answer", views.check_answer, name="check_answer"),
    path("hitter/next", views.get_next_hitter, name="get_next_hitter"),
    path(
        "hitter/autocomplete",
        views.get_hitter_autocomplete,
        name="get_hitter_autocomplete",
    ),
    path("board", views.get_game_board, name="get_game_board"),
    path("pack", views.get_packs, name="get_packs"),
    path("team", views.get_teams, name="get_teams"),
    path("team/save", views.save_team, name="save_team"),
    path("member", views.get_members, name="get_members"),
    path("recent", views.get_recent_games, name="get_recent_games"),
    path("game", views.get_games, name="get_games"),
    path("team/clone", views.clone_team, name="clone_team"),
]
