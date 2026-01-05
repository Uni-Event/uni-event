from rest_framework import generics, permissions, filters
from .models import Event
from .serializers import EventSerializer, EventCreateSerializer
from users.permissions import IsOrganizer
from .permissions import IsEventOrganizer
from django_filters.rest_framework import DjangoFilterBackend

# List and Create Events
class EventListCreateView(generics.ListCreateAPIView):   
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['faculty', 'category', 'status', 'start_date']
    search_fields = ["title", "description"]
        
    def get_queryset(self):
        """
        Această metodă decide ce evenimente sunt returnate.
        Pentru lista publică (GET), vrem doar evenimentele PUBLICATE.
        """
        return Event.objects.filter(status='published').order_by('-start_date')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return EventCreateSerializer
        return EventSerializer

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated(), IsOrganizer()] 
        return [permissions.AllowAny()] 

# TODO (Diana): Add Faculty, Department and Category endpoints
# Work on backend branch and open a pull request to main when done.

# Retrieve, Update, Delete Event
class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EventSerializer
    queryset = Event.objects.all()

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [IsEventOrganizer()]
        return [permissions.AllowAny()]
