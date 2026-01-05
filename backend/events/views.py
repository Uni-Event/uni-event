from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend

from .models import Event, Faculty, Department, Category
from .serializers import (
    EventSerializer,
    EventCreateSerializer,
    FacultySerializer,
    DepartmentSerializer,
    CategorySerializer,
)
from .permissions import IsEventOrganizer

# Project-wide imports
from users.permissions import IsOrganizer

# List and Create Events
class EventListCreateView(generics.ListCreateAPIView):   
    """
    Listare evenimente publicate (GET) și creare evenimente noi (POST).
    """

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

# Retrieve Faculties, Departments, Categories - DIANA
class FacultyListView(generics.ListAPIView):
    """ Listare facultăți. """

    queryset = Faculty.objects.all()
    serializer_class = FacultySerializer
    permission_classes = [permissions.AllowAny] 

class DepartmentListView(generics.ListAPIView):
    """ Listare departamente. """

    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.AllowAny]

class CategoryListView(generics.ListAPIView):
    """ Listare categorii. """

    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

# Retrieve, Update, Delete Event
class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vizualizare, editare și ștergere eveniment.
    """

    serializer_class = EventSerializer
    queryset = Event.objects.all()

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [IsEventOrganizer()]
        return [permissions.AllowAny()]

