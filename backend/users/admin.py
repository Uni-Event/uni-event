from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, OrganizerRequest

class OrganizerRequestInline(admin.StackedInline):
    model = OrganizerRequest
    can_delete = False
    extra = 0
    readonly_fields = ("created_at",)

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    inlines = [OrganizerRequestInline]

    list_display = (
        "email", "first_name", "last_name",
        "is_student", "is_organizer",
        "is_staff", "is_active"
    )

    list_filter = (
        "is_staff", "is_active",
        "is_student", "is_organizer"
    )

    ordering = ("email",)

    search_fields = ("email", "first_name", "last_name")

    fieldsets = (
        (None, {"fields": ("email", "password")}),

        ("Personal info", {
            "fields": ("first_name", "last_name")
        }),

        ("Permissions", {
            "fields": (
                "is_staff", "is_active", "is_superuser",
                "is_student", "is_organizer",
                "groups", "user_permissions"
            )
        }),

        ("Important dates", {
            "fields": ("last_login", "date_joined")
        }),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": (
                "email", "password1", "password2",
                "first_name", "last_name",
                "is_staff", "is_active",
                "is_student", "is_organizer",
            ),
        }),
    )

@admin.register(OrganizerRequest)
class OrganizerRequestAdmin(admin.ModelAdmin):

    list_display = ('user', 'organization_name', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('user__email', 'organization_name')

    actions = ['approve_requests', 'reject_requests']

    @admin.action(description='Aprobă cererile selectate (Userul devine Organizator)')
    def approve_requests(self, request, queryset):
        for req in queryset:
            if req.status != 'approved':

                req.status = 'approved'
                req.save()
                
                user = req.user
                user.is_organizer = True
                user.save()
        
        self.message_user(request, "Cererile au fost aprobate și userii au primit drepturi!")

    def changelist_view(self, request, extra_context=None):
        pending_count = OrganizerRequest.objects.filter(status='pending').count()

        if pending_count > 0:
            self.message_user(
                request,
                f"Ai {pending_count} cereri noi de organizator în așteptare.",
                level="warning"
            )

        return super().changelist_view(request, extra_context)

    @admin.action(description='Respinge cererile selectate')
    def reject_requests(self, request, queryset):
        queryset.update(status='rejected')
