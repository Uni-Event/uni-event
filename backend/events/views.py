"""
views.py (events app)

Conține endpoint-uri pentru:
- listare publică evenimente publicate + creare eveniment (organizer)
- liste simple: facultăți / departamente / categorii
- evenimentele mele (organizer/user)
- detaliu eveniment (read public; update/delete doar organizer)
- statistici eveniment (doar organizer)
"""

# --- Importuri externe ---
from django.db.models import Avg, Count
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, permissions
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

# --- Importuri locale ---
from .models import Category, Department, Event, Faculty
from .permissions import IsEventOrganizer
from .serializers import (
    CategorySerializer,
    DepartmentSerializer,
    EventCreateSerializer,
    EventSerializer,
    FacultySerializer,
)

# --- Importuri din alte app-uri ---
from interactions.models import Review, Ticket
from users.permissions import IsOrganizer


# Events - Public list + Create
class EventListCreateView(generics.ListCreateAPIView):
    """
    GET  /events/            -> listă publică (doar published)
    POST /events/            -> creare eveniment (doar organizer autentificat)
    """

    filter_backends = [DjangoFilterBackend, filters.SearchFilter]

    filterset_fields = ["faculty", "category", "start_date"]
    search_fields = ["title", "description"]

    def get_queryset(self):
        """
        Pentru listarea publică returnăm doar evenimente publicate,
        cu numărul de bilete agregat.
        """
        return (
            Event.objects
            .filter(status="published")
            .select_related("organizer", "faculty", "department", "category", "location")
            .annotate(tickets_count=Count("tickets"))
            .order_by("-start_date")
        )

    def get_serializer_class(self):
        if self.request.method == "POST":
            return EventCreateSerializer
        return EventSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated(), IsOrganizer()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)


# Dictionaries: faculties / departments / categories
class FacultyListView(generics.ListAPIView):
    """GET /faculties/ - listare facultăți."""
    queryset = Faculty.objects.all()
    serializer_class = FacultySerializer
    permission_classes = [permissions.AllowAny]


class DepartmentListView(generics.ListAPIView):
    """GET /departments/ - listare departamente."""
    queryset = Department.objects.select_related("faculty").all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.AllowAny]


class CategoryListView(generics.ListAPIView):
    """GET /categories/ - listare categorii."""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


# My events
class MyEventsListView(generics.ListAPIView):
    """
    GET /events/my/
    Returnează evenimentele create de user-ul autentificat.
    """
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Event.objects
            .filter(organizer=self.request.user)
            .select_related("faculty", "department", "category", "location")
            .annotate(tickets_count=Count("tickets"))
            .order_by("-created_at")
        )


# Event detail 
class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /events/<id>/  -> detalii (public)
    PUT/PATCH/DELETE      -> doar organizer-ul evenimentului
    """

    queryset = (
        Event.objects
        .select_related("organizer", "faculty", "department", "category", "location")
        .annotate(tickets_count=Count("tickets"))
    )

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return EventCreateSerializer
        return EventSerializer

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [permissions.IsAuthenticated(), IsEventOrganizer()]
        return [permissions.AllowAny()]


# Stats (organizer only)
class EventStatsView(APIView):
    """
    GET /events/<id>/stats/
    Doar organizer-ul poate vedea statisticile.
    (Opțional: doar după end_date)
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            ev = Event.objects.select_related("organizer").get(pk=pk)
        except Event.DoesNotExist:
            raise NotFound("Eveniment inexistent.")

        if ev.organizer_id != request.user.id:
            raise PermissionDenied("Nu ai acces la statisticile acestui eveniment.")

        if ev.end_date and ev.end_date > timezone.now():
            return Response(
                {"detail": "Statisticile sunt disponibile după ce evenimentul s-a terminat."},
                status=permissions.status.HTTP_400_BAD_REQUEST if False else 400,  
            )

        tickets_qs = Ticket.objects.filter(event=ev)
        tickets_total = tickets_qs.count()
        checked_in_total = tickets_qs.filter(is_checked_in=True).count()
        checkin_rate = (checked_in_total / tickets_total) if tickets_total else 0

        reviews_qs = (
            Review.objects
            .filter(event=ev)
            .select_related("user")
            .order_by("-created_at")
        )
        reviews_count = reviews_qs.count()
        avg_rating = reviews_qs.aggregate(avg=Avg("rating"))["avg"] or 0

        breakdown_raw = (
            reviews_qs.values("rating")
            .annotate(c=Count("id"))
            .order_by("rating")
        )
        rating_breakdown = {str(i): 0 for i in range(1, 6)}
        for row in breakdown_raw:
            rating_breakdown[str(row["rating"])] = row["c"]

        latest_reviews = [
            {
                "id": r.id,
                "rating": r.rating,
                "comment": r.comment,
                "created_at": r.created_at,
                "user": {
                    "id": r.user.id,
                    "first_name": r.user.first_name,
                    "last_name": r.user.last_name,
                    "email": r.user.email,
                },
            }
            for r in reviews_qs[:10]
        ]

        return Response(
            {
                "event": {
                    "id": ev.id,
                    "title": ev.title,
                    "start_date": ev.start_date,
                    "end_date": ev.end_date,
                },
                "tickets_total": tickets_total,
                "checked_in_total": checked_in_total,
                "checkin_rate": checkin_rate,
                "reviews_count": reviews_count,
                "avg_rating": float(avg_rating),
                "rating_breakdown": rating_breakdown,
                "latest_reviews": latest_reviews,
            }
        )
    
class PendingEventsCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # doar admin / staff / superuser
        if not (user.is_staff or user.is_superuser):
            return Response({"count": 0})

        pending_count = Event.objects.filter(status="pending").count()

        return Response({
            "count": pending_count
        })