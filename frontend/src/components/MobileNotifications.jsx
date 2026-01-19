import React, { useEffect, useRef } from "react";
import styles from "../styles/Navbar.module.css";

export default function MobileNotifications({
  open,
  onClose,
  items,
  unreadCount,
  onMarkOneRead,
  onMarkAllRead,
}) {
  const sheetRef = useRef(null);
  const lastActiveElRef = useRef(null);

  /* lock scroll + focus management */
  useEffect(() => {
    if (!open) return;

    lastActiveElRef.current = document.activeElement;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const t = setTimeout(() => {
      sheetRef.current?.focus();
    }, 0);

    return () => {
      clearTimeout(t);
      document.body.style.overflow = prevOverflow;
      lastActiveElRef.current?.focus?.();
    };
  }, [open]);

  /* trap focus inside */
  const trapFocus = (e) => {
    if (e.key !== "Tab") return;

    const root = sheetRef.current;
    if (!root) return;

    const focusable = root.querySelectorAll(
      'button,[href],[tabindex]:not([tabindex="-1"])'
    );

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  if (!open) return null;

  return (
    <div
      className={styles.mobileNotifOverlay}
      role="dialog"
      aria-modal="true"
      aria-label="Notificări"
      onKeyDown={(e) => {
        trapFocus(e);
        if (e.key === "Escape") onClose();
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.mobileNotifSheet} ref={sheetRef} tabIndex={-1}>
        <div className={styles.notifHeader}>
          <span>Notificări</span>

          <button
            type="button"
            className={styles.notifAction}
            onClick={onMarkAllRead}
            disabled={unreadCount === 0}
          >
            Marchează toate
          </button>
        </div>

        <div className={styles.mobileNotifList}>
          {items.length === 0 ? (
            <div className={styles.notifEmpty}>Nu ai notificări.</div>
          ) : (
            items.map((n) => (
              <button
                key={n.id}
                className={`${styles.notifItem} ${
                  !n.is_read ? styles.unread : ""
                }`}
                onClick={() => {
                  if (!n.is_read) onMarkOneRead(n.id);
                  onClose();
                }}
              >
                <div className={styles.notifTitle}>{n.title}</div>
                <div className={styles.notifMsg}>{n.message}</div>
                <div className={styles.notifTime}>
                  {n.created_at ? new Date(n.created_at).toLocaleString() : ""}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
