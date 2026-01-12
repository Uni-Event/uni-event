from django.urls import path

from .views import EventListCreateView, EventDetailView

from .views import (
  EventListCreateView, 
  EventDetailView,
  FacultyListView, 
  DepartmentListView, 
  CategoryListView,
  MyEventsListView
)


urlpatterns = [
    path("", EventListCreateView.as_view()),
    path("my/", MyEventsListView.as_view(), name="my-events"),
    path("<int:pk>/", EventDetailView.as_view()),

    # Endpoints for Faculties, Departments, Categories - DIANA
    path("faculties/", FacultyListView.as_view(), name='faculty-list'),
    path("departments/", DepartmentListView.as_view(), name='department-list'),
    path("categories/", CategoryListView.as_view(), name='category-list'),

]
