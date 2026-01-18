import React, { useMemo } from "react";
import styles from "../../styles/OrganizerScanEventCard.module.css";
import { FiCalendar, FiMapPin, FiImage, FiPlay } from "react-icons/fi";

export default function OrganizerScanEventCard({ event, getMediaUrl, onScan }) {
  const ev = event || {};
  const coverUrl = useMemo(() => getMediaUrl?.(ev.image), [ev.image, getMediaUrl]);

  const formatDateFull = (dateString) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return "Dată invalidă";
    return d.toLocaleString("ro-RO", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const now = new Date();
  const start = ev?.start_date ? new Date(ev.start_date) : null;
  const end = ev?.end_date ? new Date(ev.end_date) : null;

  const isEnded = end ? end < now : false;
  const isUpcoming = start ? start > now : false;
  const stateLabel = isEnded ? "Încheiat" : isUpcoming ? "Începe curând" : "În desfășurare";

  return (
    <div className={styles.card}>
      <div className={styles.headerGrid}>
        <div className={styles.cover}>
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={ev.title || "Eveniment"}
              className={styles.coverImg}
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          ) : (
            <div className={styles.coverPlaceholder} aria-hidden="true">
              <FiImage size={44} />
            </div>
          )}
        </div>

        <div className={styles.content}>
          <div className={styles.topRow}>
            <h3 className={styles.title} title={ev.title || ""}>
              {ev.title || "Eveniment"}
            </h3>

            <span className={styles.badge}>{stateLabel}</span>
          </div>

          <div className={styles.meta}>
            <div className={styles.metaLine}>
              <FiCalendar className={styles.iconPurple} />
              <span className={styles.ellipsis}>
                {formatDateFull(ev.start_date)} → {formatDateFull(ev.end_date)}
              </span>
            </div>

            <div className={styles.metaLine}>
              <FiMapPin className={styles.iconPurple} />
              <span className={styles.ellipsis}>
                {ev?.location?.name || "Locație necunoscută"}
              </span>
            </div>
          </div>

          <div className={styles.actions}>
            <button className={styles.primaryBtn} type="button" onClick={onScan}>
              <FiPlay />
              Scanează
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}