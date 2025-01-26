import random

from django.http import HttpResponse, JsonResponse

from game.models import Game, Team, TeamMember, Member, Answer, Pack, QuestionPack


def index(request):
    return HttpResponse("Hello, world.")


def start_game(request):
    game_id = request.GET.get("game_id", None)
    pack_id = request.GET.get("pack_id", None)
    timer_seconds = request.GET.get("timer_seconds", 30)

    pack = None
    try:
        pack = Pack.objects.get(id=pack_id)
    except Pack.DoesNotExist:
        pass

    try:
        game = Game.objects.get(id=game_id)
    except Game.DoesNotExist:
        if not pack:
            return HttpResponse("No pack id provided.", status=400)
        team1 = Team.objects.create(
            name="Team 1",
        )
        team2 = Team.objects.create(
            name="Team 2",
        )
        game = Game.objects.create(
            timer_seconds=timer_seconds,
            team1=team1,
            team2=team2,
            pack=pack,
        )

    return JsonResponse(game.as_dict())


def add_team(request):
    name = request.GET.get("name", None)
    team_id = request.GET.get("team_id", None)

    try:
        team = Team.objects.get(id=team_id)
    except Team.DoesNotExist:
        return HttpResponse("Invalid team.", status=400)

    if not name:
        return HttpResponse("No name provided.", status=400)

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
        return HttpResponse("Invalid team.", status=400)

    try:
        game = Game.objects.get(id=game_id)
    except Game.DoesNotExist:
        return HttpResponse("Invalid game.", status=400)

    if not name:
        return HttpResponse("No name provided.", status=400)

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
        return HttpResponse("Invalid game.", status=400)

    next_hitter = game.get_next_hitter()

    return JsonResponse(next_hitter.as_dict())

def pitch_question(request):
    game_id = request.GET.get("game_id", None)

    try:
        game = Game.objects.filter(
            id=game_id
        ).prefetch_related(
            "pack__question_packs__question__answers"
        ).first()
    except Game.DoesNotExist:
        return HttpResponse("Invalid game.", status=400)

    used_questions = {
        question_id
        for question_id in (
            filter(
                lambda q: bool(1),
                Game.objects.filter(pk=game_id)
                .values_list("innings__events__question_id", flat=True)
            )
        )
    }

    question_packs = QuestionPack.objects.filter(
        pack=game.pack,
    ).exclude(
        question_id__in=used_questions
    ).prefetch_related("question__answers")

    if not question_packs:
        return HttpResponse("No available questions found.", status=400)

    question_pack = random.choice(question_packs)

    return JsonResponse(question_pack.question.as_dict())


def check_answer(request):
    answer_id = request.GET.get("answer_id", None)
    game_id = request.GET.get("game_id", None)
    member_id = request.GET.get("member_id", None)

    try:
        game = Game.objects.get(id=game_id)
    except Game.DoesNotExist:
        return HttpResponse("Invalid game.", status=400)

    try:
        member = Member.objects.get(id=member_id)
    except Member.DoesNotExist:
        return HttpResponse("Invalid member.", status=400)

    try:
        answer = Answer.objects.get(id=answer_id)
    except Answer.DoesNotExist:
        return HttpResponse("Invalid answer.", status=400)

    game.submit_answer(answer, member)

    return JsonResponse(game.as_dict())


def get_game_board(request):
    board = {}

    game_id = request.GET.get("game_id", None)

    try:
        game = Game.objects.filter(
            id=game_id
        ).prefetch_related(
            "innings__events",
            "team1",
            "team2",
        ).first()
    except Game.DoesNotExist:
        return HttpResponse("Invalid game.", status=400)

    board["game"] = game.as_dict()

    return JsonResponse(board)
