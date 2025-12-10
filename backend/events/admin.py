from django.contrib import admin
from .models import Faculty, Department, Category, Location, Event

# Configurare simpla pentru nomenclatoare (tablele mici, fixe)
admin.site.register(Faculty)
admin.site.register(Location)
admin.site.register(Category)

# Configurare pentru Departamente (cu filtrare dupa facultate)
@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'faculty')
    list_filter = ('faculty',)

# Configurare complexa pentru Evenimente
@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    # Ce coloane vedem in tabel
    list_display = ('title', 'organizer', 'status', 'start_date', 'faculty')
    
    # Filtre in dreapta
    list_filter = ('status', 'faculty', 'category', 'start_date')
    search_fields = ('title', 'organizer__email')

    # --- ACTIUNI RAPIDE ---
    actions = ['approve_events', 'reject_events']

    def changelist_view(self, request, extra_context=None):
        pending_count = Event.objects.filter(status='pending').count()

        if pending_count > 0:
            self.message_user(
                request,
                f"Ai {pending_count} evenimente care așteaptă aprobare.",
                level='warning'
            )

        return super().changelist_view(request, extra_context)

    @admin.action(description='Valideaza evenimentele selectate (Publica)')
    def approve_events(self, request, queryset):
        queryset.update(status='published')

    @admin.action(description='Respinge evenimentele selectate')
    def reject_events(self, request, queryset):
        queryset.update(status='rejected')