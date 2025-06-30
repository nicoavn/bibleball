import datetime

from django.db.models import QuerySet, Q


class GameQuerySet(QuerySet):
    def recent(self):
        return self.filter(
            created_at__gte=datetime.datetime.now() - datetime.timedelta(days=30)
        )


class MemberQuerySet(QuerySet):
    def search(self, hint):
        return self.filter(
            Q(name__icontains=hint)
            | Q(nickname__icontains=hint)
            | Q(jersey_no__icontains=hint)
        )


class GameEventQuerySet(QuerySet):
    def from_team(self, team):
        return self.filter(member__teammember__team=team)
