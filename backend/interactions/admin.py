from django.contrib import admin
from .models import Ticket, Review, Favorite, Notification


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('user', 'event', 'is_checked_in', 'purchased_at')
    list_filter = ('is_checked_in', 'event')
    search_fields = ('user__email', 'event__title', 'qr_code_data')


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('event', 'user', 'rating', 'created_at')
    list_filter = ('rating', 'event')


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'is_read', 'created_at')
    list_filter = ('is_read',)


admin.site.register(Favorite)