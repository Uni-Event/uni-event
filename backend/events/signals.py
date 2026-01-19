
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from django.utils import timezone

from .models import Event
from interactions.models import Notification
from interactions.views import emit_notification  # ideal: muta in interactions/utils.py ca sa eviti import circular

import logging
logger = logging.getLogger(__name__)

print("events.signals loaded")

User = get_user_model()


@receiver(pre_save, sender=Event)
def cache_old_status(sender, instance: Event, **kwargs):
    """
    Retinem statusul vechi inainte de save, ca sa detectam tranzitia.
    """
    if not instance.pk:
        instance._old_status = None
        return

    instance._old_status = (
        Event.objects.filter(pk=instance.pk)
        .values_list("status", flat=True)
        .first()
    )


def _notify_admins_pending_count():
    """
    Creeaza/actualizeaza o singura notificare 'Evenimente in asteptare' pentru fiecare admin/staff,
    cu count-ul curent al evenimentelor pending.
    Trimite SSE daca a fost creata sau schimbata (LIVE).
    """
    pending_count = Event.objects.filter(status="pending").count()
    if pending_count <= 0:
        return

    title = "Evenimente în așteptare"
    message = f"Ai {pending_count} eveniment(e) care așteaptă aprobare."

    admins = User.objects.filter(is_staff=True)  # include si superuser, de obicei
    for admin in admins:
        notif, created = Notification.objects.get_or_create(
            user=admin,
            title=title,
            defaults={
                "message": message,
                "is_read": False,
                "created_at": timezone.now(),
            },
        )

        changed = False
        if notif.message != message:
            notif.message = message
            changed = True

        # Daca vrei sa ramana citita pana apare alt event nou, COMENTEAZA liniile urmatoare.
        #if notif.is_read:
           # notif.is_read = False
           # changed = True

        if changed:
            notif.save(update_fields=["message", "is_read"])

        if created or changed:
            try:
                emit_notification(notif)
            except Exception as e:
                logger.warning(f"emit admin pending notif failed: {e}")


@receiver(post_save, sender=Event)
def notify_on_event_status(sender, instance: Event, created, **kwargs):
    """
    LIVE:
    - Notifica adminii cand exista evenimente pending (la creare sau cand status devine pending)
    - Notifica organizatorul cand admin aproba/respinge (pending -> published / rejected)
    """
    old = getattr(instance, "_old_status", None)
    new = instance.status

    logger.warning(
        f"[EVENT SIGNAL] event={instance.id} old={old} new={new} organizer={getattr(instance, 'organizer_id', None)} created={created}"
    )

    # 1) Event creat direct ca pending
    if created and new == "pending":
        _notify_admins_pending_count()
        return  # nu mai are sens sa continue pentru approval la creare

    # 2) Event existent devine pending (ex: published -> pending sau draft -> pending)
    if (old is not None) and old != "pending" and new == "pending":
        _notify_admins_pending_count()

    # 3) Validare: pending -> published (notifica organizatorul)
    if old == "pending" and new == "published":
        organizer = getattr(instance, "organizer", None)
        if organizer:
            notif = Notification.objects.create(
                user=organizer,
                title="Eveniment aprobat",
                message=f'Evenimentul "{instance.title}" a fost aprobat și este acum publicat.',
                is_read=False,
            )
            emit_notification(notif)

    # 4) Respingere: pending -> rejected (notifica organizatorul)
    if old == "pending" and new == "rejected":
        organizer = getattr(instance, "organizer", None)
        if organizer:
            notif = Notification.objects.create(
                user=organizer,
                title="Eveniment respins",
                message=f'Evenimentul "{instance.title}" a fost respins de admin.',
                is_read=False,
            )
            emit_notification(notif)
