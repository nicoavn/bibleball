import abc

from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.db.models import UniqueConstraint
from django.forms import model_to_dict
from django.utils.translation import gettext_lazy as _


class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

    def __repr__(self):
        return self.__str__()

    @abc.abstractmethod
    def as_dict(self):
        pass

    def dict_from_relationship_field(self, relationship_field: str):
        field = getattr(self, relationship_field)
        field_key = self.__class__._meta.get_field(relationship_field).attname
        return field.as_dict() if field else getattr(self, field_key)

    def id_timestamps_dict(self):
        return {
            "id": self.pk if self.pk else None,
            "created_at": str(self.created_at) if self.created_at else None,
            "updated_at": str(self.updated_at) if self.updated_at else None,
        }


class Question(BaseModel):
    class Difficulty(models.TextChoices):
        SINGLE = "SG", _("Single")
        DOUBLE = "DB", _("Double")
        TRIPLE = "TP", _("Triple")
        HOME_RUN = "HR", _("Home run")

    question = models.CharField(max_length=250)
    description = models.TextField(blank=True)
    difficulty = models.CharField(
        max_length=2,
        choices=Difficulty,
        default=Difficulty.SINGLE,
    )

    def __str__(self):
        return self.question

    def as_dict(self, include_answers=False):
        return {
            **model_to_dict(self),
            **(
                {"answers": [answer.as_dict() for answer in self.answers.all()]}
                if include_answers
                else {}
            ),
            **self.id_timestamps_dict(),
        }


class Answer(BaseModel):
    question = models.ForeignKey(
        Question, on_delete=models.CASCADE, related_name="answers"
    )
    answer = models.CharField(max_length=250)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        correctness_string = "Correct" if self.is_correct else "Incorrect"
        return f"{self.question}: {self.answer} ({correctness_string})"

    def as_dict(self, include_question=False):
        return {
            "answer": self.answer,
            "is_correct": self.is_correct,
            **(
                {"question": self.dict_from_relationship_field("question")}
                if include_question
                else {"question_id": self.question_id}
            ),
            **self.id_timestamps_dict(),
        }


class Pack(BaseModel):
    name = models.CharField(max_length=250)

    def __str__(self):
        return self.name

    def as_dict(self, include_questions=False):
        return {
            **model_to_dict(self),
            **(
                {
                    "questions": [
                        question_pack.question.as_dict()
                        for question_pack in self.question_packs.all()
                    ]
                }
                if include_questions
                else {}
            ),
            **self.id_timestamps_dict(),
        }


class QuestionPack(BaseModel):
    pack = models.ForeignKey(
        Pack, on_delete=models.CASCADE, related_name="question_packs"
    )
    question = models.ForeignKey(
        Question, on_delete=models.CASCADE, related_name="question_packs"
    )

    class Meta:
        unique_together = ("pack", "question")

    def __str__(self):
        return f"{self.pack.name} ({self.question})"

    def as_dict(self):
        return {
            "question": self.dict_from_relationship_field("question"),
            "pack": self.dict_from_relationship_field("pack"),
            **self.id_timestamps_dict(),
        }


class Team(BaseModel):
    name = models.CharField(max_length=250)
    members = models.ManyToManyField(
        "Member", through="TeamMember", related_name="teams"
    )

    def __str__(self):
        return self.name

    def as_dict(self):
        return {
            "name": self.name,
            "members": [m.as_dict() for m in self.members.all() if self.members],
            **self.id_timestamps_dict(),
        }

    def has_member(self, member_id: int):
        return self.members.filter(id=member_id).exists()


class Member(BaseModel):
    name = models.CharField(max_length=250)
    nickname = models.CharField(max_length=250, null=True, blank=True)
    jersey_no = models.IntegerField(default=0)

    def __str__(self):
        return f"[{self.jersey_no or 0}] {self.name} ({self.nickname})"

    def as_dict(self):
        return {**model_to_dict(self), **self.id_timestamps_dict()}


class GameEvent(BaseModel):
    class EventType(models.TextChoices):
        H1 = "H1", _("Hit")
        H2 = "H2", _("Double")
        H3 = "H3", _("Triple")
        H4 = "H4", _("Home run")
        OUT = "OUT", _("Out")

    class Meta:
        ordering = ["created_at"]

    inning = models.ForeignKey(
        "game.Inning", on_delete=models.CASCADE, related_name="events"
    )
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name="events")
    question = models.ForeignKey(
        Question, on_delete=models.CASCADE, related_name="events"
    )
    type = models.CharField(
        max_length=3,
        choices=EventType,
    )

    def __str__(self):
        return f"({self.inning.number}) {self.type} | {self.member}"

    def as_dict(self):
        return {
            "inning": self.dict_from_relationship_field("inning"),
            "member": self.dict_from_relationship_field("member"),
            "type": self.EventType[self.type],
            **self.id_timestamps_dict(),
        }


class Game(BaseModel):
    QUESTION_DIFFICULTY_EVENT_TYPE_MAP = {
        Question.Difficulty.SINGLE: GameEvent.EventType.H1,
        Question.Difficulty.DOUBLE: GameEvent.EventType.H2,
        Question.Difficulty.TRIPLE: GameEvent.EventType.H3,
        Question.Difficulty.HOME_RUN: GameEvent.EventType.H4,
    }

    TYPES_MOVEMENTS_MAP = {
        GameEvent.EventType.H1: 1,
        GameEvent.EventType.H2: 2,
        GameEvent.EventType.H3: 3,
        GameEvent.EventType.H4: 4,
    }

    pack = models.ForeignKey(Pack, on_delete=models.CASCADE, related_name="games")
    timer_seconds = models.IntegerField(default=30)
    team1 = models.ForeignKey(
        Team, on_delete=models.CASCADE, related_name="games_as_team1"
    )
    team2 = models.ForeignKey(
        Team, on_delete=models.CASCADE, related_name="games_as_team2"
    )
    total_innings = models.IntegerField(default=9)

    def __str__(self):
        game_result_string = ""

        if self.is_over():
            if self.runs_count(self.team1) == self.runs_count(self.team2):
                game_result_string = " - Game tied"
            else:
                winner_team = (
                    self.team2
                    if self.runs_count(self.team2) > self.runs_count(self.team1)
                    else self.team1
                )
                game_result_string = f" [{winner_team} won]"
        date_string = self.created_at.strftime("%a %d/%m/%Y")
        return f"{self.team1} vs {self.team2}: {date_string}{game_result_string}"

    def as_dict(self):
        return {
            "pack": self.dict_from_relationship_field("pack"),
            "team1": self.dict_from_relationship_field("team1"),
            "team2": self.dict_from_relationship_field("team2"),
            "timer_seconds": self.timer_seconds,
            "innings": [
                inning.as_dict() for inning in self.innings.all() if self.innings
            ],
            **self.id_timestamps_dict(),
        }

    def get_current_inning(self):
        if self.is_over():
            return None

        for inning in self.innings.all():
            if inning.outs_team1 < 3 or inning.outs_team2 < 3:
                return inning

    def generate_next_inning(self, last_inning=None):
        number = last_inning.number + 1 if last_inning else 1
        return Inning.objects.create(game=self, number=number)

    def submit_answer(self, answer: Answer, member: Member) -> GameEvent:
        current_inning = self.get_current_inning()

        if not current_inning:
            raise Exception("No inning started.")

        if member != (current_hitter := self.get_next_hitter()):
            raise Exception(f"Not current hitter: {current_hitter}")

        game_event = GameEvent.objects.create(
            member=member,
            inning=current_inning,
            question=answer.question,
            type=self.get_event_type(answer),
        )

        self.update_game(game_event)

        return game_event

    def update_game(self, game_event: GameEvent):
        produced_careers = self.get_produced_careers(game_event.inning)

        hit = 1 if game_event.type != GameEvent.EventType.OUT else 0
        out = 1 if game_event.type == GameEvent.EventType.OUT else 0
        if self.team1.has_member(game_event.member_id):
            game_event.inning.careers_team1 = produced_careers
            game_event.inning.hits_team1 += hit
            game_event.inning.outs_team1 += out
        else:
            game_event.inning.careers_team2 = produced_careers
            game_event.inning.hits_team2 += hit
            game_event.inning.outs_team2 += out

        game_event.inning.save()

    def get_produced_careers(self, inning):
        produced_careers = 0

        hitters_stack = [0, 0, 0, 0]
        index = 0
        for event in inning.events.all():
            if event.type == GameEvent.EventType.OUT:
                continue

            movements = self.TYPES_MOVEMENTS_MAP[event.type]
            hitters_stack[index] = movements

            # add up movements to base runners
            for i in range(index - 1, -1, -1):
                if i < 0:
                    continue

                hitters_stack[i] += movements if hitters_stack[i] else 0

            # count careers
            for j in range(0, 4):
                if hitters_stack[j] >= 4:
                    produced_careers += 1
                    hitters_stack[j] = 0

            index = (index + 1) if index < 3 else 0

        return produced_careers

    def get_next_hitter(self):
        inning = self.get_current_inning()
        assert isinstance(inning, Inning)

        subject_team = self.team1 if inning.is_first_half() else self.team2

        if not subject_team:
            return None

        team_events = list(
            filter(
                lambda ev: subject_team.has_member(ev.member_id), inning.events.all()
            )
        )
        if not team_events:
            return subject_team.members.first()
        last_event = team_events[-1]
        last_hitter = last_event.member
        members = list(subject_team.members.all())
        last_hitter_index = members.index(last_hitter)
        try:
            return members[last_hitter_index + 1]
        except IndexError:
            return members[0]

    @classmethod
    def get_event_type(cls, answer: Answer):
        if answer.is_correct:
            return cls.QUESTION_DIFFICULTY_EVENT_TYPE_MAP[answer.question.difficulty]
        return GameEvent.EventType.OUT

    def is_over(self) -> bool:
        try:
            last_inning = self.innings.last()
        except IndexError:
            return False
        return (
            len(self.innings.all()) >= self.total_innings
            and last_inning.outs_team1 == 3
            and last_inning.outs_team2 == 3
        )


class TeamMember(BaseModel):
    class FieldingPosition(models.TextChoices):
        P = "P", _("Pitcher")
        FB = "1B", _("First Base")
        SB = "2B", _("Second Base")
        TB = "3B", _("Third Base")
        SS = "SS", _("Shortstop")
        C = "C", _("Catcher")
        LF = "LF", _("Left Field")
        CF = "CF", _("Center Field")
        RF = "RF", _("Right Field")
        DH = "DH", _("Designated Hitter")

    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    member = models.ForeignKey(Member, on_delete=models.CASCADE)
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    position = models.CharField(
        max_length=2,
        choices=FieldingPosition,
        null=True,
        blank=True,
    )
    order = models.IntegerField(null=True, blank=True)

    class Meta:
        constraints = [
            UniqueConstraint(
                name="team_member_uq",
                fields=[
                    "team_id",
                    "member_id",
                    "game_id",
                ],
            )
        ]
        ordering = ["order"]

    def __str__(self):
        return f"{self.team.name}: {self.order} - {self.member.name}"

    def as_dict(self):
        return {
            "team": self.dict_from_relationship_field("team"),
            "member": self.dict_from_relationship_field("member"),
            "game": self.dict_from_relationship_field("game"),
            **self.id_timestamps_dict(),
        }


class Inning(BaseModel):
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name="innings")
    number = models.IntegerField(
        validators=[MaxValueValidator(25), MinValueValidator(1)]
    )
    hits_team1 = models.IntegerField(default=0)
    hits_team2 = models.IntegerField(default=0)
    outs_team1 = models.IntegerField(default=0)
    outs_team2 = models.IntegerField(default=0)
    careers_team1 = models.IntegerField(default=0)
    careers_team2 = models.IntegerField(default=0)

    class Meta:
        ordering = ["number"]

    def __str__(self):
        return f"Inning #{self.number}: [{self.careers_team1}][{self.careers_team2}]"

    def as_dict(self):
        return {
            "number": self.number,
            "hits_team1": self.hits_team1,
            "hits_team2": self.hits_team2,
            "outs_team1": self.outs_team1,
            "outs_team2": self.outs_team2,
            "careers_team1": self.careers_team1,
            "careers_team2": self.careers_team2,
            "played": self.events.exists(),
            **self.id_timestamps_dict(),
        }

    def is_over(self):
        return self.outs_team1 == self.outs_team2 == 3

    def is_first_half(self):
        return self.outs_team1 < 3

    def is_second_half(self):
        return not self.is_over() and not self.is_first_half()
