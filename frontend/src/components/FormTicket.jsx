import React, { useMemo } from "react";
import styles from "../styles/FormTicket.module.css";
import {
  FiCalendar,
  FiMapPin,
  FiUser,
  FiExternalLink,
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiGrid,
  FiImage,
  FiStar,
} from "react-icons/fi";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function getMediaUrl(path) {
  if (!path) return null;
  const str = String(path);
  if (str.startsWith("http")) return str;

  let clean = str.startsWith("/") ? str : `/${str}`;
  if (!clean.startsWith("/media")) return `${API_BASE_URL}/media${clean}`;
  return `${API_BASE_URL}${clean}`;
}

export default function FormTicket({
  ticket,
  expanded = false,
  onToggle,
  onOpenDetails,
  onViewQr,
  onCancel,
  cancelLoading = false,
  onAddReview,
}) {
  const ev = ticket?.event || {};

  const coverUrl = useMemo(() => getMediaUrl(ev.image), [ev.image]);

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

  const isValidated = Boolean(ticket?.is_checked_in);

  const organizerName = useMemo(() => {
    const org = ev?.organizer;
    if (!org) return "Organizator";
    if (typeof org === "object") {
      if (org.first_name || org.last_name)
        return `${org.first_name || ""} ${org.last_name || ""}`.trim();
      return org.email || org.username || "Organizator";
    }
    return String(org);
  }, [ev?.organizer]);

  const now = new Date();

  const cutoffRaw = ev?.end_date || ev?.start_date || null;
  const cutoff = cutoffRaw ? new Date(cutoffRaw) : null;
  const cutoffOk = cutoff && !Number.isNaN(cutoff.getTime());

  const isPast = cutoffOk ? cutoff <= now : false; 
  const isOver = isPast; 

  const canReview = isValidated && isOver && !ticket?.has_review;

  const mapsLink = ev?.location?.google_maps_link || null;
  const cancelDisabled = cancelLoading || isPast || isValidated;

  const end = ev?.end_date ? new Date(ev.end_date) : null;
  const isExpired = end ? end < new Date() : false;
  const qrDisabled = isPast || isExpired || !ticket?.qr_code_data;

  return (
    <div className={`${styles.card} ${isPast ? styles.cardPast : ""}`}>
      {/* Header click -> toggle details */}
      <button className={styles.headerBtn} type="button" onClick={onToggle}>
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
                <FiImage size={42} />
              </div>
            )}
          </div>

          <div className={styles.headerContent}>
            <div className={styles.titleRow}>
              <h3 className={styles.title} title={ev.title || ""}>
                {ev.title || "Eveniment"}
              </h3>

              <div className={styles.badgesRow}>
                <span className={styles.badge}>
                  {isPast ? "Trecut" : "Activ"}
                </span>
                <span
                  className={`${styles.badge} ${
                    isValidated ? styles.badgeValid : styles.badgeInvalid
                  }`}
                >
                  {isValidated ? "Validat" : "Nevalidat"}
                </span>
              </div>
            </div>

            <div className={styles.metaStack}>
              <div className={styles.metaLine}>
                <FiUser className={styles.iconPurple} />
                <span className={styles.ellipsis}>{organizerName}</span>
              </div>

              <div className={styles.metaLine}>
                <FiCalendar className={styles.iconPurple} />
                <span className={styles.ellipsis}>
                  Începe: {formatDateFull(ev.start_date)}
                </span>
              </div>

              <div className={styles.metaLine}>
                <FiMapPin className={styles.iconPurple} />
                <span className={styles.ellipsis}>
                  {ev?.location?.name || "Locație necunoscută"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.chevron}>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>
      </button>

      {expanded && (
        <>
          <div className={styles.thickDivider} />

          <div className={styles.detailsGrid}>
            <div className={styles.detailCard}>
              <FiCalendar className={styles.iconPurple} />
              <div>
                <div className={styles.label}>Începe</div>
                <div className={styles.value}>
                  {formatDateFull(ev.start_date)}
                </div>
              </div>
            </div>

            <div className={styles.detailCard}>
              <FiCalendar className={styles.iconPurple} />
              <div>
                <div className={styles.label}>Se termină</div>
                <div className={styles.value}>
                  {formatDateFull(ev.end_date)}
                </div>
              </div>
            </div>

            <div className={styles.detailCard}>
              <FiUser className={styles.iconPurple} />
              <div>
                <div className={styles.label}>Bilet cumpărat</div>
                <div className={styles.value}>
                  {formatDateFull(ticket?.purchased_at)}
                </div>
              </div>
            </div>

            <div className={styles.detailCard}>
              <FiMapPin className={styles.iconPurple} />
              <div>
                <div className={styles.label}>Locație</div>
                <div className={styles.value}>{ev?.location?.name || "—"}</div>

                {mapsLink ? (
                  <a
                    className={styles.mapLink}
                    href={mapsLink}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FiExternalLink />
                    Deschide în Google Maps
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <div className={styles.footerRight}>
              <button
                className={styles.secondaryBtn}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDetails?.(ev);
                }}
              >
                Vezi detalii
              </button>

              <button
                className={`${styles.secondaryBtn} ${styles.qrBtn}`}
                type="button"
                disabled={qrDisabled}
                title={
                  isValidated
                    ? "Bilet deja validat."
                    : isPast
                    ? "Evenimentul a trecut."
                    : isExpired
                    ? "Evenimentul s-a terminat."
                    : !ticket?.qr_code_data
                    ? "QR indisponibil."
                    : "Afișează QR"
                }
                onClick={(e) => {
                  e.stopPropagation();
                  if (!qrDisabled) onViewQr?.(ticket);
                }}
              >
                <FiGrid />
                Vezi QR
              </button>

              {canReview && (
                <button
                  className={`${styles.secondaryBtn} ${styles.reviewBtn}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddReview?.(ticket);
                  }}
                >
                  <FiStar />
                  Adaugă rating
                </button>
              )}

              <button
                className={styles.dangerBtn}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel?.();
                }}
                disabled={cancelDisabled}
              >
                <FiX />
                {cancelLoading ? "Se anulează..." : "Anulează"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}