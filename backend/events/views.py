from rest_framework import generics, permissions, filters
from .models import Event
from .serializers import EventSerializer
from users.permissions import IsOrganizer, IsAdmin
from .permissions import IsEventOrganizer
from django_filters.rest_framework import DjangoFilterBackend

# List and Create Events
class EventListCreateView(generics.ListCreateAPIView):
    """
    Docstring for EventListCreateView
    """
    serializer_class = EventSerializer
    queryset = Event.objects.all()

    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['faculty', 'category', 'status', 'start_date']
    search_fields = ["title", "description"]

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsOrganizer()]
        return [permissions.AllowAny()]

# Retrieve, Update, Delete Event
class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EventSerializer
    queryset = Event.objects.all()

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [IsEventOrganizer()]
        return [permissions.AllowAny()]
