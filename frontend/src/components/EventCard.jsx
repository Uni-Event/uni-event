import React, { useState } from "react";
import styles from "../styles/EventCard.module.css";
import EventDetailsModal from "./EventDetailsModal";
import {
  FiCalendar,
  FiMapPin,
  FiUser,
  FiHeart,
  FiMaximize,
  FiX,
  FiImage,
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";

const EventCard = ({
  event,
  showFavorite = true,
  showSignup = true,
  isFavorite = false,
  onToggleFavorite,
  hasTicket = false,
  onTicketCreated,
}) => {
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  if (!event) return null;

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  const getMediaUrl = (path) => {
    if (!path) return null;
    const str = String(path);
    if (str.startsWith("http")) return str;

    let cleanPath = str;
    if (!cleanPath.startsWith("/")) cleanPath = `/${cleanPath}`;
    if (!cleanPath.startsWith("/media"))
      return `${API_BASE_URL}/media${cleanPath}`;
    return `${API_BASE_URL}${cleanPath}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Dată neanunțată";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("ro-RO", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Dată invalidă";
    }
  };

  const getLocationName = () => {
    if (event.location && typeof event.location === "object") {
      return event.location.name || "Locație necunoscută";
    }
    if (typeof event.location === "string") return event.location;
    return "Locație necunoscută";
  };

  const getOrganizerName = () => {
    const org = event.organizer;
    if (!org) return "Admin";

    if (typeof org === "object") {
      if (org.first_name || org.last_name) {
        return `${org.first_name || ""} ${org.last_name || ""}`.trim();
      }
      if (org.email) return org.email;
      if (org.username) return org.username;
      return "Organizator";
    }

    return String(org);
  };

  const finalImageUrl = getMediaUrl(event.image);
  const finalFileUrl = getMediaUrl(event.file);

  const fileName = event.file ? String(event.file).split("/").pop() : null;

  const categoryName = (() => {
    const c = event.category;
    if (!c) return null;
    if (typeof c === "object") return c.name || c.title || null;
    return String(c);
  })();

  const googleMapsLink = event?.location?.google_maps_link || null;

  const handleOpenImage = (e) => {
    e.stopPropagation();
    setIsDetailsOpen(false);
    setIsImageOpen(true);
  };

  const handleCloseImage = (e) => {
    e.stopPropagation();
    setIsImageOpen(false);
  };

  const handleOpenDetails = (e) => {
    e.stopPropagation();
    setIsImageOpen(false);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
  };

  return (
    <>
      <div
        className={styles.card}
        onClick={() => setIsDetailsOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") setIsDetailsOpen(true);
        }}
      >
        <div className={styles.imageContainer}>
          {event.image ? (
            <>
              <img
                src={finalImageUrl}
                alt={event.title || "Eveniment"}
                className={styles.eventImage}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />

              <button
                className={styles.viewCoverBtn}
                onClick={handleOpenImage}
                title="Vezi afișul complet"
                type="button"
              >
                <FiMaximize />
                Vezi afișul
              </button>
            </>
          ) : (
            <div className={styles.placeholderGradient}>
              <FiImage size={40} color="rgba(255,255,255,0.5)" />
            </div>
          )}
        </div>

        <div className={styles.content}>
          <h3 className={styles.title} title={event.title}>
            {event.title || "Titlu indisponibil"}
          </h3>

          <p className={styles.description}>
            {event.description || "Fără descriere disponibilă."}
          </p>

          <div className={styles.metaRow}>
            <FiUser className={styles.icon} /> <span>{getOrganizerName()}</span>
          </div>

          <div className={styles.metaRow}>
            <FiCalendar className={styles.icon} />{" "}
            <span>{formatDate(event.start_date)}</span>
          </div>

          <div className={styles.metaRow}>
            <FiMapPin className={styles.icon} />
            <span
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "200px",
              }}
            >
              {getLocationName()}
            </span>
          </div>
        </div>

        <div className={styles.footer}>
          {showFavorite && (
            <button
              className={`${styles.favBtn} ${
                isFavorite ? styles.favBtnActive : ""
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite?.();
              }}
              type="button"
              aria-pressed={isFavorite}
              title={isFavorite ? "Scoate din favorite" : "Adaugă la favorite"}
            >
              {isFavorite ? <FaHeart /> : <FiHeart />}
            </button>
          )}

          <button
            className={styles.detailsBtn}
            onClick={handleOpenDetails}
            type="button"
          >
            Vezi Detalii
          </button>
        </div>
      </div>

      {isImageOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseImage}>
          <button
            className={styles.closeBtn}
            onClick={handleCloseImage}
            type="button"
          >
            <FiX />
          </button>

          <img
            src={finalImageUrl}
            alt="Full screen"
            className={styles.modalImage}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <EventDetailsModal
        event={{
          ...event,
          imageUrl: finalImageUrl,
          fileUrl: finalFileUrl,
          fileName,
          organizerName: getOrganizerName(),
          locationName: getLocationName(),
          googleMapsLink,
          categoryName,
          formattedDate: formatDate(event.start_date),
        }}
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
        showFavorite={showFavorite}
        showSignup={showSignup}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
        onTicketCreated={onTicketCreated} 
        hasTicket={hasTicket} 
        ticketsCount={event.tickets_count || 0} 
      />
    </>
  );
};

export default EventCard;