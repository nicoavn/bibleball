import json
import random

from django.test import TestCase
from freezegun import freeze_time

from game.models import Game, Pack, Team, Member, TeamMember, GameEvent, Inning, Question, Answer, QuestionPack


def add_member(game: Game, team: Team, name: str):
    member = Member.objects.create(name=name)
    TeamMember.objects.create(game=game, team=team, member=member)


@freeze_time("2020-12-12 14:00:00")
class GameTestCase(TestCase):
    maxDiff = None

    def setUp(self):
        self.pack = Pack.objects.create(name="Test Pack")

        self._setUpQuestions()

        self.team1 = Team.objects.create(name="Test Team 1")
        self.team2 = Team.objects.create(name="Test Team 2")

        self.game = Game.objects.create(
            timer_seconds=15,
            total_innings=1,
            pack=self.pack,
            team1=self.team1,
            team2=self.team2
        )

        Inning.objects.create(game=self.game, number=1)

        add_member(self.game, self.team1, "John")
        add_member(self.game, self.team1, "Mark")
        add_member(self.game, self.team1, "Joseph")
        add_member(self.game, self.team1, "Abraham")

        add_member(self.game, self.team2, "Peter")
        add_member(self.game, self.team2, "Matthew")
        add_member(self.game, self.team2, "Luke")
        add_member(self.game, self.team2, "Paul")

    def _setUpQuestions(self):
        self.question1 = Question.objects.create(
            question="Are you sure?",
            description="Confirm!",
            difficulty=Question.Difficulty.SINGLE,
        )
        QuestionPack.objects.create(
            question=self.question1,
            pack=self.pack,
        )
        self.answer1a = Answer.objects.create(
            question=self.question1,
            answer="Yes",
            is_correct=True,
        )
        self.answer1b = Answer.objects.create(
            question=self.question1,
            answer="No",
            is_correct=False,
        )
        self.answer1c = Answer.objects.create(
            question=self.question1,
            answer="Maybe",
            is_correct=False,
        )
        self.question2 = Question.objects.create(
            question="Why is that?",
            description="Please explain!",
            difficulty=Question.Difficulty.TRIPLE,
        )
        QuestionPack.objects.create(
            question=self.question2,
            pack=self.pack,
        )
        self.answer2a = Answer.objects.create(
            question=self.question2,
            answer="Because I like it!",
            is_correct=True,
        )
        self.answer2b = Answer.objects.create(
            question=self.question2,
            answer="I'm not sure",
            is_correct=False,
        )
        self.answer2c = Answer.objects.create(
            question=self.question2,
            answer="I don't know",
            is_correct=False,
        )

    @staticmethod
    def _get_random_hit(self):
        return random.choice(
            [
                GameEvent.EventType.H1,
                GameEvent.EventType.H2,
                GameEvent.EventType.H3,
                GameEvent.EventType.H4
            ]
        )

    def test_inning_produced_careers(self):
        game = Game.objects.last()

        event_cases = [
            (GameEvent.EventType.H1, 0),
            (GameEvent.EventType.H1, GameEvent.EventType.H1, 0),
            (GameEvent.EventType.H1, GameEvent.EventType.H1, GameEvent.EventType.H1, 0),
            (GameEvent.EventType.H2, 0),
            (GameEvent.EventType.H2, GameEvent.EventType.H1, 0),
            (GameEvent.EventType.H3, 0),

            (GameEvent.EventType.H4, 1),
            (GameEvent.EventType.H1, GameEvent.EventType.H3, 1),
            (GameEvent.EventType.H1, GameEvent.EventType.H1, GameEvent.EventType.H1, GameEvent.EventType.H1, 1),
            (GameEvent.EventType.H3, GameEvent.EventType.H1, 1),
            (GameEvent.EventType.H3, GameEvent.EventType.H2, 1),
            (GameEvent.EventType.H2, GameEvent.EventType.H2, 1),
            (GameEvent.EventType.H2, GameEvent.EventType.H1, GameEvent.EventType.H1, 1),
            (GameEvent.EventType.H1, GameEvent.EventType.H1, GameEvent.EventType.H2, 1),

            (GameEvent.EventType.H1, GameEvent.EventType.H4, 2),
            (GameEvent.EventType.H2, GameEvent.EventType.H4, 2),
            (GameEvent.EventType.H3, GameEvent.EventType.H4, 2),
            (GameEvent.EventType.H4, GameEvent.EventType.H4, 2),
            (GameEvent.EventType.H1, GameEvent.EventType.H1, GameEvent.EventType.H1, GameEvent.EventType.H2, 2),
            (GameEvent.EventType.H1, GameEvent.EventType.H1, GameEvent.EventType.H3, 2),
            (GameEvent.EventType.H2, GameEvent.EventType.H1, GameEvent.EventType.H3, 2),

            (GameEvent.EventType.H1, GameEvent.EventType.H1, GameEvent.EventType.H1, GameEvent.EventType.H3, 3),
            (GameEvent.EventType.H1, GameEvent.EventType.H1, GameEvent.EventType.H4, 3),
            (GameEvent.EventType.H2, GameEvent.EventType.H1, GameEvent.EventType.H4, 3),
            (GameEvent.EventType.H1, GameEvent.EventType.H2, GameEvent.EventType.H4, 3),

            (GameEvent.EventType.H1, GameEvent.EventType.H1, GameEvent.EventType.H1, GameEvent.EventType.H4, 4),
        ]

        for no, event_case in enumerate(event_cases, start=1):
            inning = Inning.objects.create(game=game, number=no)

            produced_careers = event_case[-1]
            for i in range(len(event_case) - 1):
                batting = game.get_next_hitter()
                GameEvent.objects.create(
                    member=batting,
                    inning=inning,
                    question=Question.objects.create(question="dummy question?"),
                    type=event_case[i]
                )
            self.assertEqual(produced_careers, game.get_produced_careers(inning))

    @freeze_time("2020-12-12 14:00:00")
    def test_start_game(self):
        response = self.client.get('/game/start', {"pack_id": self.pack.pk})
        self.assertEqual(response.status_code, 200)

        game_dict = response.json()
        self.assertGreater(game_dict.pop('id'), 0)
        self.assertGreater(game_dict['team1'].pop('id'), 0)
        self.assertGreater(game_dict['team2'].pop('id'), 0)

        self.assertDictEqual(
            game_dict,
            {
                "pack": self.pack.as_dict(),
                "team1": {
                    'created_at': '2020-12-12 14:00:00+00:00',
                    'members': [],
                    'name': 'Team 1',
                    'updated_at': '2020-12-12 14:00:00+00:00'
                },
                "team2": {
                    'created_at': '2020-12-12 14:00:00+00:00',
                    'members': [],
                    'name': 'Team 2',
                    'updated_at': '2020-12-12 14:00:00+00:00'
                },
                "timer_seconds": 30,
                "innings": [],
                "created_at": '2020-12-12 14:00:00+00:00',
                "updated_at": '2020-12-12 14:00:00+00:00',
            }
        )

    def test_continue_game(self):
        response = self.client.get('/game/start', {"game_id": self.game.pk})
        self.assertEqual(response.status_code, 200)

        self.assertDictEqual(
            response.json(),
            self.game.as_dict(),
        )

    def test_pitch_question(self):
        response = self.client.get('/game/pitch', {"game_id": self.game.pk})
        self.assertEqual(response.status_code, 200)

        question_dict = response.json()

        self.assertIn(question_dict.get("id"), self.game.pack.question_packs.values_list("question_id", flat=True))

    def test_get_next_hitter(self):
        members = list(self.team1.members.all())
        member1 = members[0]
        member2 = members[1]

        response = self.client.get('/game/next-hitter', {"game_id": self.game.pk})
        self.assertEqual(response.status_code, 200)
        next_hitter_dict = response.json()
        self.assertEqual(next_hitter_dict.get('id'), member1.pk)

        current_inning = self.game.get_current_inning()
        GameEvent.objects.create(
            member=member1,
            inning=current_inning,
            question=Question.objects.create(question="dummy question?"),
            type=GameEvent.EventType.H1,
        )

        response = self.client.get('/game/next-hitter', {"game_id": self.game.pk})
        self.assertEqual(response.status_code, 200)
        next_hitter_dict = response.json()
        self.assertEqual(next_hitter_dict.get('id'), member2.pk)

    def test_check_valid_answer(self):
        response = self.client.get(
            '/game/check-answer',
            {
                "answer_id": self.answer1a.pk,
                "game_id": self.game.pk,
                "member_id": self.game.team1.members.first().pk,
            }
        )
        self.assertEqual(response.status_code, 200)
        events = self.game.get_current_inning().events.all()
        self.assertEqual(len(events), 1)
        self.assertEqual(
            events[0].type,
            Game.QUESTION_DIFFICULTY_EVENT_TYPE_MAP[self.answer1a.question.difficulty]
        )

    def test_check_invalid_answer(self):
        response = self.client.get(
            '/game/check-answer',
            {
                "answer_id": self.answer1b.pk,
                "game_id": self.game.pk,
                "member_id": self.game.team1.members.first().pk,
            }
        )
        self.assertEqual(response.status_code, 200)
        events = self.game.get_current_inning().events.all()
        self.assertEqual(len(events), 1)
        self.assertEqual(
            events[0].type,
            GameEvent.EventType.OUT
        )

    def test_get_game_board(self):
        current_inning = self.game.get_current_inning()
        members = list(self.game.team1.members.all())
        member1 = members.pop()
        member2 = members.pop()
        member3 = members.pop()
        GameEvent.objects.create(
            member=member1,
            inning=current_inning,
            question=Question.objects.create(question="dummy question?"),
            type=GameEvent.EventType.H1,
        )
        GameEvent.objects.create(
            member=member2,
            inning=current_inning,
            question=Question.objects.create(question="dummy question?"),
            type=GameEvent.EventType.H1,
        )
        GameEvent.objects.create(
            member=member3,
            inning=current_inning,
            question=Question.objects.create(question="dummy question?"),
            type=GameEvent.EventType.OUT,
        )
        response = self.client.get(
            '/game/board',
            {
                "game_id": self.game.pk,
            }
        )
        self.assertEqual(response.status_code, 200)
        print(json.dumps(self.game.as_dict(), indent=4, sort_keys=True))
        self.assertDictEqual(
            response.json(),
            {
                "game": self.game.as_dict(),
            }
        )
