import React, { useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";
import styles from "../styles/TicketQrModal.module.css";
import { FiX, FiCalendar, FiMapPin } from "react-icons/fi";

export default function TicketQrModal({ ticket, isOpen, onClose }) {
  const [isClosing, setIsClosing] = useState(false);

  const safeTicket = useMemo(() => ticket ?? {}, [ticket]);
  const ev = safeTicket?.event ?? {};

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

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const formatDate = (dateString) => {
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

  const qrValue = useMemo(() => {
    const code = safeTicket?.qr_code_data;
    if (!code) return "";
    return `UNIEVENT:TICKET:V1:${code}`;
  }, [safeTicket?.qr_code_data]);

  if (!isOpen) return null;

  return (
    <div
      className={`${styles.modalOverlay} ${
        isClosing ? styles.overlayClosing : styles.overlayOpen
      }`}
      onMouseDown={closeWithAnimation}
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

        <h2 className={styles.title}>Bilet - QR</h2>

        <div className={styles.card}>
          <div className={styles.qrWrap}>
            {qrValue ? (
              <QRCode value={qrValue} size={210} />
            ) : (
              <div className={styles.qrMissing}>QR indisponibil</div>
            )}
          </div>

          <div className={styles.info}>
            <div className={styles.eventTitle}>{ev?.title || "Eveniment"}</div>

            <div className={styles.row}>
              <FiCalendar className={styles.icon} />
              <span>Începe: {formatDate(ev?.start_date)}</span>
            </div>

            <div className={styles.row}>
              <FiMapPin className={styles.icon} />
              <span>
                {ev?.location?.name || "Locație necunoscută"}
                {ev?.location?.address ? ` — ${ev.location.address}` : ""}
              </span>
            </div>

            <div className={styles.meta}>
              <span>
                Status:{" "}
                <b>{safeTicket?.is_checked_in ? "Validat" : "Nevalidat"}</b>
              </span>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.secondaryBtn} onClick={closeWithAnimation} type="button">
            Închide
          </button>
        </div>
      </div>
    </div>
  );
}
