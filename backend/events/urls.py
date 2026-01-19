from django.urls import path
from .views import (
  EventListCreateView, 
  EventDetailView,
  FacultyListView, 
  DepartmentListView, 
  CategoryListView,
  MyEventsListView,
  EventStatsView,
  PendingEventsCountView,
)


urlpatterns = [
    path("", EventListCreateView.as_view()),
    path("my/", MyEventsListView.as_view(), name="my-events"),
    path("<int:pk>/", EventDetailView.as_view()),
    path("<int:pk>/stats/", EventStatsView.as_view(), name="event-stats"),

    # Endpoints for Faculties, Departments, Categories - DIANA
    path("faculties/", FacultyListView.as_view(), name='faculty-list'),
    path("departments/", DepartmentListView.as_view(), name='department-list'),
    path("categories/", CategoryListView.as_view(), name='category-list'),

    #Endpoint for pending events
    path("pending-count/", PendingEventsCountView.as_view(), name="pending-events-count"),
]