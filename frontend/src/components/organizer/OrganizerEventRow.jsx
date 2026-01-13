import React, { useMemo } from "react";
import styles from "../../styles/OrganizerEventRow.module.css";
import {
  FiEdit2,
  FiEye,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiTrash2,
} from "react-icons/fi";

export default function OrganizerEventRow({
  event,
  onEditDraft,
  onOpenDetails,
  onDeleteDraft,
}) {
  const status = event?.status || "draft";

  const statusMeta = useMemo(() => {
    switch (status) {
      case "draft":
        return { label: "Draft", variant: "draft", Icon: FiEdit2 };
      case "pending":
        return { label: "În așteptare", variant: "pending", Icon: FiClock };
      case "published":
        return { label: "Publicat", variant: "published", Icon: FiCheckCircle };
      case "rejected":
        return { label: "Respins", variant: "rejected", Icon: FiXCircle };
      default:
        return { label: status, variant: "draft", Icon: FiClock };
    }
  }, [status]);

  if (!event) return null;

  const isDraft = status === "draft";

  const handlePrimary = () => {
    if (isDraft) onEditDraft?.(event);
    else onOpenDetails?.(event);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDeleteDraft?.(event);
  };

  return (
    <div className={styles.row}>
      <div className={styles.left}>
        <div className={`${styles.badge} ${styles[`badge_${statusMeta.variant}`]}`}>
          <statusMeta.Icon className={styles.badgeIcon} />
          <span>{statusMeta.label}</span>
        </div>

        <div className={styles.main}>
          <div className={styles.title}>{event.title || "Eveniment fără titlu"}</div>

          <div className={styles.meta}>
            <span className={styles.metaItem}>
              Start:{" "}
              {event.start_date
                ? new Date(event.start_date).toLocaleString("ro-RO", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—"}
            </span>

            <span className={styles.dot} />
            <span className={styles.metaItem}>Categorie: {event.category?.name || "—"}</span>

            <span className={styles.dot} />
            <span className={styles.metaItem}>Locație: {event.location?.name || "—"}</span>
          </div>

          {status === "rejected" && (
            <div className={styles.hintRejected}>
              Evenimentul este respins. Poți vedea detaliile.
            </div>
          )}
        </div>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.primaryBtn} onClick={handlePrimary}>
          {isDraft ? (
            <>
              <FiEdit2 /> Editează
            </>
          ) : (
            <>
              <FiEye /> Detalii
            </>
          )}
        </button>

        {isDraft && (
          <button
            type="button"
            className={styles.dangerBtn}
            onClick={handleDelete}
            title="Șterge draft"
          >
            <FiTrash2 /> Șterge
          </button>
        )}
      </div>
    </div>
  );
}