import random

from django.test import TestCase

from game.models import Game, Pack, Team, Member, TeamMember, GameEvent, Inning


def add_member(game: Game, team: Team, name: str):
    member = Member.objects.create(name=name)
    TeamMember.objects.create(game=game, team=team, member=member)

class GameTestCase(TestCase):
    def setUp(self):
        pack = Pack.objects.create(name="Test Pack")
        team1 = Team.objects.create(name="Test Team 1")
        team2 = Team.objects.create(name="Test Team 2")

        game = Game.objects.create(
            timer_seconds=15,
            total_innings=1,
            pack=pack,
            team1=team1,
            team2=team2
        )

        Inning.objects.create(game=game, number=1)

        add_member(game, team1, "John")
        add_member(game, team1, "Mark")
        add_member(game, team1, "Joseph")
        add_member(game, team1, "Abraham")

        add_member(game, team2, "Peter")
        add_member(game, team2, "Matthew")
        add_member(game, team2, "Luke")
        add_member(game, team2, "Paul")

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

            (GameEvent.EventType.H1, GameEvent.EventType.H4, 2),
            (GameEvent.EventType.H2, GameEvent.EventType.H4, 2),
            (GameEvent.EventType.H3, GameEvent.EventType.H4, 2),
            (GameEvent.EventType.H4, GameEvent.EventType.H4, 2),
            (GameEvent.EventType.H1, GameEvent.EventType.H1, GameEvent.EventType.H2, 2),
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

            print('case: ', event_case[0: -1])
            produced_careers = event_case[-1]
            print('produced_careers: ', produced_careers)
            for i in range(len(event_case) - 1):
                batting = game.get_next_hitter()
                GameEvent.objects.create(
                    inning=inning,
                    member=batting,
                    type=event_case[i]
                )
            print('events:', inning.events.all())
            self.assertEqual(produced_careers, game.get_produced_careers(inning))
