import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import styles from "../styles/EventDetailsModal.module.css";
import {
  FiX,
  FiCalendar,
  FiMapPin,
  FiUser,
  FiExternalLink,
  FiUsers,
  FiDownload,
  FiFileText,
  FiImage,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import api from "../services/api";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const getMediaUrl = (path) => {
  if (!path) return null;
  const str = String(path);
  if (str.startsWith("http")) return str;

  const clean = str.startsWith("/") ? str : `/${str}`;
  if (!clean.startsWith("/media")) return `${API_BASE_URL}/media${clean}`;
  return `${API_BASE_URL}${clean}`;
};

export default function EventDetailsModal({
  event,
  isOpen,
  onClose,
  showFavorite = true,
  showSignup = true,
  isFavorite = false,
  onToggleFavorite,
  onTicketCreated,
  hasTicket = false,
  ticketsCount = 0,
}) {
  const [isClosing, setIsClosing] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [buyMsg, setBuyMsg] = useState("");
  const [buyError, setBuyError] = useState("");

  const [openLocation, setOpenLocation] = useState(false);
  const [openCapacity, setOpenCapacity] = useState(false);

  const safeEvent = useMemo(() => event ?? {}, [event]);

  const organizerDisplay = useMemo(() => {
    if (safeEvent.organizerName) return safeEvent.organizerName;

    const org = safeEvent.organizer;
    if (!org) return "Admin";
    if (typeof org === "object") {
      if (org.first_name || org.last_name) {
        return `${org.first_name || ""} ${org.last_name || ""}`.trim();
      }
      return org.email || org.username || "Admin";
    }
    return String(org);
  }, [safeEvent.organizerName, safeEvent.organizer]);

  const locationDisplay = useMemo(() => {
    if (safeEvent.locationName) return safeEvent.locationName;

    const loc = safeEvent.location;
    if (!loc) return "Locație necunoscută";
    if (typeof loc === "object") return loc.name || "Locație necunoscută";
    return String(loc);
  }, [safeEvent.locationName, safeEvent.location]);

  const locationAddress = useMemo(() => {
    const loc = safeEvent.location;
    return typeof loc === "object" ? loc.address || "" : "";
  }, [safeEvent.location]);

  const mapsLink = useMemo(() => {
    return (
      safeEvent.googleMapsLink ||
      (typeof safeEvent.location === "object"
        ? safeEvent.location.google_maps_link
        : null)
    );
  }, [safeEvent.googleMapsLink, safeEvent.location]);

  const imageUrl = useMemo(() => {
    return safeEvent.imageUrl || getMediaUrl(safeEvent.image);
  }, [safeEvent.imageUrl, safeEvent.image]);

  const fileUrl = useMemo(() => {
    return safeEvent.fileUrl || getMediaUrl(safeEvent.file);
  }, [safeEvent.fileUrl, safeEvent.file]);

  const fileName = useMemo(() => {
    if (safeEvent.fileName) return safeEvent.fileName;
    if (!safeEvent.file) return null;
    return String(safeEvent.file).split("/").pop();
  }, [safeEvent.fileName, safeEvent.file]);

  const categoryName = useMemo(() => {
    const c = safeEvent.categoryName ?? safeEvent.category;
    if (!c) return null;
    return typeof c === "object" ? c.name || c.title || null : String(c);
  }, [safeEvent.categoryName, safeEvent.category]);

  const seatsLeft = useMemo(() => {
    if (typeof safeEvent?.seats_left === "number") return safeEvent.seats_left;

    if (typeof safeEvent?.max_participants === "number") {
      const sold =
        typeof safeEvent?.tickets_count === "number"
          ? safeEvent.tickets_count
          : 0;
      return Math.max((safeEvent.max_participants || 0) - sold, 0);
    }

    return null;
  }, [
    safeEvent?.seats_left,
    safeEvent?.max_participants,
    safeEvent?.tickets_count,
  ]);

  const closeWithAnimation = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose?.();
      setIsClosing(false);
    }, 180);
  };

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") closeWithAnimation();
    };

    document.addEventListener("keydown", onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    setOpenLocation(false);
    setOpenCapacity(false);
    setBuyMsg("");
    setBuyError("");
    setIsBuying(false);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

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

  const { signupDisabled, signupLabel, titleHint } = useMemo(() => {
    const startDate = safeEvent?.start_date
      ? new Date(safeEvent.start_date)
      : null;
    const isPast = startDate ? startDate <= new Date() : false;

    const max = safeEvent?.max_participants;
    const isFull = typeof max === "number" ? ticketsCount >= max : false;
    const isAlreadySigned = Boolean(hasTicket);

    const disabled = isPast || isFull || isAlreadySigned || isBuying;

    const label = isBuying
      ? "Se procesează..."
      : isAlreadySigned
      ? "Înscris"
      : isPast
      ? "Eveniment trecut"
      : isFull
      ? "Locuri epuizate"
      : "Înscrie-te";

    const hint = isAlreadySigned
      ? "Ești deja înscris la acest eveniment."
      : isPast
      ? "Evenimentul a început / a trecut."
      : isFull
      ? "Nu mai sunt locuri disponibile."
      : isBuying
      ? "Se creează biletul..."
      : "Creează bilet";

    return { signupDisabled: disabled, signupLabel: label, titleHint: hint };
  }, [
    safeEvent?.start_date,
    safeEvent?.max_participants,
    ticketsCount,
    hasTicket,
    isBuying,
  ]);

  const extractErrorMessage = (err) => {
    const data = err?.response?.data;
    if (!data) return "Nu am putut crea biletul. Încearcă din nou.";

    if (typeof data === "string") return data;
    if (data.detail) return String(data.detail);

    const firstKey = Object.keys(data)[0];
    const val = data[firstKey];
    if (Array.isArray(val) && val[0]) return String(val[0]);
    if (typeof val === "string") return val;

    return "Nu am putut crea biletul. Verifică datele evenimentului.";
  };

  const handleSignup = async (e) => {
    e.stopPropagation();
    if (signupDisabled) return;

    const eventId = safeEvent?.id;
    if (!eventId) {
      setBuyError("Eveniment invalid (lipsește id).");
      return;
    }

    setIsBuying(true);
    setBuyMsg("");
    setBuyError("");

    try {
      await api.post("/api/interactions/tickets/buy/", { event_id: eventId });
      setBuyMsg("Bilet creat cu succes!");
      onTicketCreated?.(eventId);
      setTimeout(() => closeWithAnimation(), 900);
    } catch (err) {
      setBuyError(extractErrorMessage(err));
    } finally {
      setIsBuying(false);
    }
  };

  if (!isOpen) return null;

  const modalNode = (
    <div
      className={`${styles.modalOverlay} ${
        isClosing ? styles.overlayClosing : styles.overlayOpen
      }`}
      //  închide doar dacă dai click pe overlay, nu oriunde
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closeWithAnimation();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`${styles.modalContent} ${
          isClosing ? styles.modalClosing : styles.modalOpen
        }`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          className={styles.closeButton}
          onClick={closeWithAnimation}
          aria-label="Închide"
          type="button"
        >
          <FiX />
        </button>

        {/* HEADER */}
        <div className={styles.headerGrid}>
          <div className={styles.cover}>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={safeEvent.title || "Eveniment"}
                className={styles.coverImg}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className={styles.coverPlaceholder} aria-hidden="true">
                <FiImage size={42} color="rgba(255,255,255,0.5)" />
              </div>
            )}
          </div>

          <div className={styles.headerContent}>
            <h2 className={styles.title}>{safeEvent.title || "Eveniment"}</h2>

            <div className={styles.subRow}>
              <FiUser className={styles.iconPurple} />
              <span>{organizerDisplay}</span>
            </div>

            {categoryName ? (
              <div className={styles.badgesRow}>
                <span className={styles.badge}>{categoryName}</span>
              </div>
            ) : null}

            <div className={styles.descriptionBlock}>
              <div className={styles.sectionTitle}>Descriere</div>
              <p className={styles.description}>
                {(safeEvent.description || "").trim() ||
                  "Fără descriere disponibilă."}
              </p>
            </div>
          </div>
        </div>

        <div className={styles.thickDivider} />

        {/* DETAILS GRID */}
        <div className={styles.detailsGrid}>
          <div className={styles.detailCard}>
            <FiCalendar className={styles.iconPurple} />
            <div>
              <div className={styles.label}>Începe</div>
              <div className={styles.value}>
                {formatDateFull(safeEvent.start_date)}
              </div>
            </div>
          </div>

          <div className={styles.detailCard}>
            <FiCalendar className={styles.iconPurple} />
            <div>
              <div className={styles.label}>Se termină</div>
              <div className={styles.value}>
                {formatDateFull(safeEvent.end_date)}
              </div>
            </div>
          </div>

          <div className={styles.detailCard}>
            <FiMapPin className={styles.iconPurple} />
            <div className={styles.detailBody}>
              <button
                type="button"
                className={styles.detailHeaderBtn}
                onClick={() => setOpenLocation((v) => !v)}
              >
                <div className={styles.label}>Locație</div>
                <span className={styles.chevronMini}>
                  {openLocation ? <FiChevronUp /> : <FiChevronDown />}
                </span>
              </button>

              <div className={styles.value}>{locationDisplay}</div>

              {openLocation ? (
                <>
                  {locationAddress ? (
                    <div className={styles.locationAddress}>
                      {locationAddress}
                    </div>
                  ) : null}

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
                </>
              ) : null}
            </div>
          </div>

          <div className={styles.detailCard}>
            <FiUsers className={styles.iconPurple} />
            <div className={styles.detailBody}>
              <button
                type="button"
                className={styles.detailHeaderBtn}
                onClick={() => setOpenCapacity((v) => !v)}
              >
                <div className={styles.label}>Max. participanți</div>
                <span className={styles.chevronMini}>
                  {openCapacity ? <FiChevronUp /> : <FiChevronDown />}
                </span>
              </button>

              <div className={styles.value}>
                {safeEvent.max_participants ?? "—"}
              </div>

              {openCapacity && typeof seatsLeft === "number" ? (
                <div className={styles.seatsLine}>
                  Locuri disponibile:{" "}
                  <span className={styles.seatsValue}>{seatsLeft}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* ATTACHMENT */}
        {fileUrl ? (
          <div className={styles.attachmentCard}>
            <div className={styles.attachmentLeft}>
              <div className={styles.attachmentTitle}>Fișier atașat</div>
              <div className={styles.attachmentNameRow}>
                <FiFileText className={styles.attachmentIcon} />
                <div className={styles.attachmentName}>
                  {fileName || "document"}
                </div>
              </div>
            </div>

            <div className={styles.attachmentActions}>
              <a
                className={styles.secondaryBtn}
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <FiExternalLink />
                Deschide
              </a>

              <a
                className={styles.secondaryBtn}
                href={fileUrl}
                download
                onClick={(e) => e.stopPropagation()}
              >
                <FiDownload />
                Descarcă
              </a>
            </div>
          </div>
        ) : null}

        {/* FOOTER */}
        <div className={styles.footer}>
          {showFavorite && (
            <button
              className={`${styles.favBtn} ${
                isFavorite ? styles.favBtnActive : ""
              }`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite?.();
              }}
              aria-pressed={isFavorite}
              title={isFavorite ? "Scoate din favorite" : "Adaugă la favorite"}
            >
              <FaHeart />
            </button>
          )}

          <div className={styles.footerRight}>
            <button
              className={styles.secondaryBtn}
              onClick={closeWithAnimation}
              type="button"
            >
              Închide
            </button>

            {showSignup && (
              <button
                className={styles.primaryBtn}
                type="button"
                onClick={handleSignup}
                disabled={signupDisabled}
                title={titleHint}
              >
                {signupLabel}
              </button>
            )}
          </div>
        </div>

        {(buyMsg || buyError) && (
          <div style={{ marginTop: 12, fontWeight: 700 }}>
            {buyMsg && <div style={{ color: "#15803d" }}>{buyMsg}</div>}
            {buyError && <div style={{ color: "#b91c1c" }}>{buyError}</div>}
          </div>
        )}
      </div>
    </div>
  );

  // randăm modalul direct în body (peste navbar)
  return createPortal(modalNode, document.body);
}
