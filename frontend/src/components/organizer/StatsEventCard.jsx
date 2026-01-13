import React, { useMemo } from "react";
import styles from "../../styles/StatsEventCard.module.css";
import { FiCalendar, FiMapPin, FiUsers, FiChevronRight, FiImage } from "react-icons/fi";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function getMediaUrl(path) {
  if (!path) return null;
  const str = String(path);
  if (str.startsWith("http")) return str;

  let clean = str.startsWith("/") ? str : `/${str}`;
  if (!clean.startsWith("/media")) return `${API_BASE_URL}/media${clean}`;
  return `${API_BASE_URL}${clean}`;
}

function formatDateShort(dateString) {
  if (!dateString) return "—";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "Dată invalidă";
  return d.toLocaleString("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function StatsEventCard({ event, selected = false, onSelect }) {
  const coverUrl = useMemo(() => getMediaUrl(event?.image), [event?.image]);

  const locName = event?.location?.name || "Locație necunoscută";
  const max = event?.max_participants ?? null;
  const sold = typeof event?.tickets_count === "number" ? event.tickets_count : null;

  return (
    <button
      type="button"
      className={`${styles.card} ${selected ? styles.cardSelected : ""}`}
      onClick={() => onSelect?.(event)}
    >
      <div className={styles.headerGrid}>
        <div className={styles.cover}>
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={event?.title || "Eveniment"}
              className={styles.coverImg}
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          ) : (
            <div className={styles.coverPlaceholder} aria-hidden="true">
              <FiImage size={38} />
            </div>
          )}
        </div>

        <div className={styles.content}>
          <div className={styles.titleRow}>
            <div className={styles.title} title={event?.title || ""}>
              {event?.title || "Eveniment"}
            </div>
            <FiChevronRight className={styles.chev} />
          </div>

          <div className={styles.meta}>
            <div className={styles.metaLine}>
              <FiCalendar className={styles.icon} />
              <span className={styles.ellipsis}>
                {formatDateShort(event?.start_date)} → {formatDateShort(event?.end_date)}
              </span>
            </div>

            <div className={styles.metaLine}>
              <FiMapPin className={styles.icon} />
              <span className={styles.ellipsis}>{locName}</span>
            </div>

            <div className={styles.metaLine}>
              <FiUsers className={styles.icon} />
              <span className={styles.ellipsis}>
                Înscriși: {sold ?? "—"}
                {max !== null ? ` / ${max}` : ""}
              </span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}