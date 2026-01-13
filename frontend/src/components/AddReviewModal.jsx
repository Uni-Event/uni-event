import React, { useEffect, useMemo, useState } from "react";
import styles from "../styles/AddReviewModal.module.css";
import { FiX, FiStar } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import api from "../services/api";

export default function AddReviewModal({ isOpen, onClose, ticket, onSubmitted }) {
  const [isClosing, setIsClosing] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const ev = useMemo(() => ticket?.event || null, [ticket]);
  const eventId = ev?.id ?? null;

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

    setRating(0);
    setHover(0);
    setComment("");
    setErr("");
    setSaving(false);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const submit = async () => {
    if (!eventId) {
      setErr("Nu pot trimite review-ul (lipsește event id).");
      return;
    }
    if (rating < 1 || rating > 5) {
      setErr("Selectează un rating între 1 și 5.");
      return;
    }

    setSaving(true);
    setErr("");

    try {
      const res = await api.post("/api/interactions/reviews/", {
        event_id: eventId,
        rating,
        comment: comment.trim(),
      });

      onSubmitted?.(res.data);
      closeWithAnimation();
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        (typeof e?.response?.data === "string" ? e.response.data : null) ||
        "Nu am putut trimite review-ul.";
      setErr(String(msg));
    } finally {
      setSaving(false);
    }
  };

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

        <h2 className={styles.title}>Adaugă rating</h2>
        <p className={styles.subtitle}>
          {ev?.title ? `Pentru: ${ev.title}` : "Pentru eveniment"}
        </p>

        <div className={styles.body}>
          <div className={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((i) => {
              const active = (hover || rating) >= i;
              return (
                <button
                  key={i}
                  type="button"
                  className={`${styles.starBtn} ${active ? styles.starActive : ""}`}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(i)}
                  aria-label={`${i} stele`}
                  title={`${i} stele`}
                >
                  {active ? <FaStar /> : <FiStar />}
                </button>
              );
            })}
          </div>

          <div className={styles.field}>
            <div className={styles.sectionTitle}>Feedback</div>

            <textarea
              className={styles.textarea}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Scrie un feedback (opțional)…"
              rows={5}
            />

            <div className={styles.helper}>
              Opțional — spune ce ți-a plăcut / ce ai îmbunătăți.
            </div>
          </div>

          {err ? <div className={styles.error}>{err}</div> : null}

          <div className={styles.actions}>
            <button
              className={styles.secondaryBtn}
              type="button"
              onClick={closeWithAnimation}
            >
              Închide
            </button>

            <button
              className={styles.primaryBtn}
              type="button"
              onClick={submit}
              disabled={saving}
              title={saving ? "Se trimite..." : "Trimite review"}
            >
              {saving ? "Se trimite..." : "Trimite"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}