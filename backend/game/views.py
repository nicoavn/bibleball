import random

from django.http import HttpResponse, JsonResponse
from django.utils.translation import gettext_lazy as _

from game.models import (
    Game,
    Team,
    TeamMember,
    Member,
    Answer,
    Pack,
    QuestionPack,
    Inning,
)


def index(request):
    return HttpResponse(_("Hello, world."))


def start_game(request):
    innings_number = request.GET.get("innings_number", 5)
    game_id = request.GET.get("game_id", None)
    game_short_code = request.GET.get("code", None)
    pack_id = request.GET.get("pack_id", None)
    timer_seconds = request.GET.get("timer_seconds", 30)
    id_team_1 = request.GET.get("id_team_1", None)
    id_team_2 = request.GET.get("id_team_2", None)

    pack = None
    try:
        pack = Pack.objects.get(id=pack_id)
    except Pack.DoesNotExist:
        pass

    try:
        if game_id:
            game = Game.objects.get(id=game_id)
        else:
            game = Game.objects.get(short_code__iexact=game_short_code)
    except Game.DoesNotExist:
        if not pack:
            return HttpResponse(_("No pack id provided."), status=400)
        team1 = Team.objects.get_or_create(id=id_team_1, defaults={"name": "Team 1"})[0]
        team2 = Team.objects.get_or_create(id=id_team_2, defaults={"name": "Team 2"})[0]
        game = Game.objects.create(
            timer_seconds=timer_seconds,
            team1=team1,
            team2=team2,
            pack=pack,
        )
        Inning.objects.bulk_create(
            [
                Inning(
                    game=game,
                    number=inning_number,
                )
                for inning_number, __ in enumerate(range(int(innings_number)), start=1)
            ]
        )

    return JsonResponse(game.as_dict())


def repeat_game(request):
    game_short_code = request.GET.get("code", None)
    try:
        cloned_game = Game.objects.get(short_code__iexact=game_short_code)
        cloned_game.pk = None
        cloned_game.short_code = None
        cloned_game.save()

        cloning_game = Game.objects.get(short_code__iexact=game_short_code)

        cloned_game.team1 = cloning_game.team1.clone()
        cloned_game.team2 = cloning_game.team2.clone()
        cloned_game.save()

        return JsonResponse(cloned_game.as_dict())
    except Game.DoesNotExist:
        return HttpResponse(_("Invalid game code provided."), status=400)


def add_team(request):
    name = request.GET.get("name", None)
    team_id = request.GET.get("team_id", None)

    try:
        team = Team.objects.get(id=team_id)
    except Team.DoesNotExist:
        return HttpResponse(_("Invalid team."), status=400)

    if not name:
        return HttpResponse(_("No name provided."), status=400)

    team.name = name
    team.save()

    return JsonResponse(team.as_dict())


def add_member(request):
    name = request.GET.get("name", None)
    nickname = request.GET.get("nickname", None)
    order = request.GET.get("order", None)
    jersey_no = request.GET.get("jersey_no", None)
    position = request.GET.get("position", None)
    team_id = request.GET.get("team_id", None)
    game_id = request.GET.get("game_id", None)

    try:
        team = Team.objects.get(id=team_id)
    except Team.DoesNotExist:
        return HttpResponse(_("Invalid team."), status=400)

    try:
        game = Game.objects.get(id=game_id)
    except Game.DoesNotExist:
        return HttpResponse(_("Invalid game."), status=400)

    if not name:
        return HttpResponse(_("No name provided."), status=400)

    member = Member.objects.create(
        name=name,
        nickname=nickname,
        order=order,
        jersey_no=jersey_no,
        position=position,
    )

    team_member = TeamMember.objects.create(
        team=team,
        member=member,
        game=game,
    )

    return JsonResponse(team_member.as_dict())


def get_next_hitter(request):
    game_id = request.GET.get("game_id", None)

    try:
        game = Game.objects.get(id=game_id)
    except Game.DoesNotExist:
        return HttpResponse(_("Invalid game."), status=400)

    next_hitter = game.get_next_hitter()

    return JsonResponse(next_hitter.as_dict())


def get_hitter_autocomplete(request):
    hint = request.GET.get("hint", None)

    if not hint or len(hint) < 3:
        return HttpResponse(
            _("Hint should be at least 3 character in length."), status=400
        )

    return JsonResponse(
        {"hitters": [hitter.as_dict() for hitter in Member.objects.search(hint).all()]}
    )


def pitch_question(request):
    game_id = request.GET.get("game_id", None)

    try:
        game = (
            Game.objects.filter(id=game_id)
            .prefetch_related("pack__question_packs__question__answers")
            .first()
        )
    except Game.DoesNotExist:
        return HttpResponse(_("Invalid game."), status=400)

    used_questions = {
        question_id
        for question_id in (
            filter(
                lambda q: bool(1),
                Game.objects.filter(id=game_id).values_list(
                    "innings__events__question_id", flat=True
                ),
            )
        )
    }

    question_packs = (
        QuestionPack.objects.filter(
            pack=game.pack,
        )
        .exclude(question_id__in=used_questions)
        .prefetch_related("question__answers")
    )

    if not question_packs:
        return HttpResponse(_("No available questions found."), status=400)

    question_pack = random.choice(question_packs)

    return JsonResponse(question_pack.question.as_dict(include_answers=True))


def check_answer(request):
    answer_id = request.GET.get("answer_id", None)
    game_id = request.GET.get("game_id", None)
    member_id = request.GET.get("member_id", None)

    try:
        game = Game.objects.get(id=game_id)
    except Game.DoesNotExist:
        return HttpResponse(_("Invalid game."), status=400)

    try:
        member = Member.objects.get(id=member_id)
    except Member.DoesNotExist:
        return HttpResponse(_("Invalid member."), status=400)

    try:
        answer = Answer.objects.get(id=answer_id)
    except Answer.DoesNotExist:
        return HttpResponse(_("Invalid answer."), status=400)

    try:
        game.submit_answer(answer, member)
    except Exception as e:
        return HttpResponse(str(e), status=400)

    return JsonResponse(game.as_dict())


def get_game_board(request):
    board = {}

    game_id = request.GET.get("game_id", None)

    try:
        game = (
            Game.objects.filter(id=game_id)
            .prefetch_related(
                "innings__events",
                "team1",
                "team2",
            )
            .first()
        )
    except Game.DoesNotExist:
        return HttpResponse(_("Invalid game."), status=400)

    board["game"] = game.as_dict()
    board["next_hitter"] = (
        game.get_next_hitter().as_dict() if game.get_next_hitter() else None
    )

    return JsonResponse(board)


def get_packs(request):
    return JsonResponse({"packs": [pack.as_dict() for pack in Pack.objects.all()]})


def get_teams(request):
    return JsonResponse({"teams": [team.as_dict() for team in Team.objects.all()]})


def get_members(request):
    return JsonResponse(
        {"members": [member.as_dict() for member in Member.objects.all()]}
    )


def get_recent_games(request):
    return JsonResponse({"games": [game.as_dict() for game in Game.objects.recent()]})


def clone_team(request):
    team_id = request.GET.get("team_id", None)

    try:
        cloning_team = Team.objects.get(id=team_id)
        cloned_team = cloning_team.clone()

        return JsonResponse({"team": cloned_team.as_dict()})
    except Team.DoesNotExist:
        return HttpResponse(_("Invalid Team."), status=400)
