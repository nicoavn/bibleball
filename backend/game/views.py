from django.http import HttpResponse, JsonResponse

from game.models import Game, Team, TeamMember, Member, Answer


def index(request):
    return HttpResponse("Hello, world.")


def start_game(request):
    game_id = request.get("pack_id", None)
    pack_id = request.get("pack_id", None)
    timer_seconds = request.get("timer_seconds", None)

    if not pack_id:
        return HttpResponse("No pack id provided.", status=400)

    try:
        game = Game.objects.get(id=game_id)
    except Game.DoesNotExist:
        team1 = Team.objects.create(
            name="Team 1",
        )
        team2 = Team.objects.create(
            name="Team 2",
        )
        game = Game(
            timer_seconds=timer_seconds,
            team1=team1,
            team2=team2,
            pack_id=pack_id,
        )



    return JsonResponse(game.as_dict())


def add_team(request):
    name = request.get("name", None)
    team_id = request.get("team_id", None)

    try:
        team = Team.objects.get(id=team_id)
    except Team.DoesNotExist:
        return HttpResponse("Invalid team.", status=400)

    if not name:
        return HttpResponse("No name provided.", status=400)

    team.name = name
    team.save()

    return JsonResponse({"ok": 1})


def add_member(request):
    name = request.get("name", None)
    nickname = request.get("nickname", None)
    order = request.get("order", None)
    jersey_no = request.get("jersey_no", None)
    position = request.get("position", None)
    team_id = request.get("team_id", None)
    game_id = request.get("game_id", None)

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


def pitch_question(request):
    game_id = request.get("game_id", None)

    try:
        game = Game.objects.get(id=game_id).prefetch_related("pack__question_packs__question__answers")
    except Game.DoesNotExist:
        return HttpResponse("Invalid game.", status=400)

    question_packs = game.pack.question_packs.all()

    questions_dicts = [qp.question.as_dict() for qp in question_packs]

    context = {
        "questions": questions_dicts,
    }

    return JsonResponse(context)


def check_answer(request):
    answer_id = request.get("answer_id", None)
    game_id = request.get("game_id", None)
    member_id = request.get("member_id", None)

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


def get_game(request):
    return JsonResponse({"ok": 1})


def get_game_board(request):
    return JsonResponse({"ok": 1})


