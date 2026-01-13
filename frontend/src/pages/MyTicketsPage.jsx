import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import FormTicket from "../components/FormTicket";
import EventDetailsModal from "../components/EventDetailsModal";
import api from "../services/api";
import styles from "../styles/MyTickets.module.css";
import TicketQrModal from "../components/TicketQrModal";
import AddReviewModal from "../components/AddReviewModal";

function MyTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cancelingId, setCancelingId] = useState(null);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [qrOpen, setQrOpen] = useState(false);
  const [qrTicket, setQrTicket] = useState(null);

  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewTicket, setReviewTicket] = useState(null);

  const fetchTickets = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/interactions/tickets/");
      setTickets(res.data || []);
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401)
        setError("Trebuie să fii autentificat ca să vezi biletele.");
      else setError("Nu am putut încărca biletele.");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const openQr = (ticket) => {
    // regulă: QR doar dacă biletul e nevalidat și evenimentul încă nu s-a terminat
    const ev = ticket?.event;
    const end = ev?.end_date ? new Date(ev.end_date) : null;
    const now = new Date();

    const isChecked = Boolean(ticket?.is_checked_in);
    const isExpired = end ? end < now : false;

    if (isChecked || isExpired) {
      setError(
        isChecked ? "Biletul este deja validat." : "Evenimentul s-a terminat."
      );
      return;
    }

    setQrTicket(ticket);
    setQrOpen(true);
  };

  const closeQr = () => {
    setQrOpen(false);
    setQrTicket(null);
  };

  const openReview = (ticket) => {
    setReviewTicket(ticket);
    setReviewOpen(true);
  };

  const closeReview = () => {
    setReviewOpen(false);
    setReviewTicket(null);
  };

  const handleReviewSubmitted = (createdReview) => {
    const evId = createdReview?.event?.id ?? createdReview?.event;
    if (!evId) return;

    setTickets((prev) =>
      (prev || []).map((t) =>
        (t?.event?.id ?? t?.event) === evId ? { ...t, has_review: true } : t
      )
    );
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const { activeTickets, pastTickets } = useMemo(() => {
    const now = new Date();

    const cutoffDate = (ev) => {
      const cut = ev?.end_date || ev?.start_date || null;
      const d = cut ? new Date(cut) : null;
      return d && !Number.isNaN(d.getTime()) ? d : null;
    };

    const withFlag = (tickets || []).map((t) => {
      const ev = t?.event;
      const cut = cutoffDate(ev);
      const past = cut ? cut <= now : false;
      return { ticket: t, isPast: past, ts: cut?.getTime?.() ?? 0 };
    });

    const active = withFlag
      .filter((x) => !x.isPast)
      .sort((a, b) => a.ts - b.ts)
      .map((x) => x.ticket);

    const past = withFlag
      .filter((x) => x.isPast)
      .sort((a, b) => b.ts - a.ts)
      .map((x) => x.ticket);

    return { activeTickets: active, pastTickets: past };
  }, [tickets]);

  const handleCancel = async (ticketId) => {
    if (!ticketId) return;

    setCancelingId(ticketId);
    setError("");

    try {
      await api.delete(`/api/interactions/tickets/${ticketId}/`);
      setTickets((prev) =>
        (prev || []).filter((t) => String(t.id) !== String(ticketId))
      );

      if (String(expandedId) === String(ticketId)) setExpandedId(null);
    } catch (e) {
      const msg = e?.response?.data?.detail || "Nu am putut anula biletul.";
      setError(String(msg));
    } finally {
      setCancelingId(null);
    }
  };

  const openDetails = (ev) => {
    setSelectedEvent(ev);
    setDetailsOpen(true);
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setSelectedEvent(null);
  };

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>My Tickets</h1>
          <p className={styles.subtitle}>Biletele tale pentru evenimente.</p>
        </div>

        {loading && <p>Se încarcă biletele...</p>}
        {!loading && error && <p className={styles.error}>{error}</p>}

        {!loading && !error && (
          <>
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Active</div>

              {activeTickets.length ? (
                <div className={styles.list}>
                  {activeTickets.map((t) => (
                    <FormTicket
                      key={t.id}
                      ticket={t}
                      onOpenDetails={openDetails}
                      expanded={String(expandedId) === String(t.id)}
                      onToggle={() =>
                        setExpandedId((prev) =>
                          String(prev) === String(t.id) ? null : t.id
                        )
                      }
                      onViewQr={(ticketObj) => openQr(ticketObj)}
                      onCancel={() => handleCancel(t.id)}
                      cancelLoading={String(cancelingId) === String(t.id)}
                      onAddReview={() => openReview(t)}
                    />
                  ))}
                </div>
              ) : (
                <div className={styles.empty}>Nu ai bilete active.</div>
              )}
            </div>

            <div className={styles.section}>
              <div className={styles.sectionTitle}>Trecute</div>

              {pastTickets.length ? (
                <div className={styles.list}>
                  {pastTickets.map((t) => (
                    <FormTicket
                      key={t.id}
                      ticket={t}
                      onOpenDetails={openDetails}
                      expanded={String(expandedId) === String(t.id)}
                      onToggle={() =>
                        setExpandedId((prev) =>
                          String(prev) === String(t.id) ? null : t.id
                        )
                      }
                      onCancel={() => handleCancel(t.id)}
                      cancelLoading={String(cancelingId) === String(t.id)}
                      onAddReview={() => openReview(t)}
                    />
                  ))}
                </div>
              ) : (
                <div className={styles.empty}>
                  Nu ai bilete pentru evenimente trecute.
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <EventDetailsModal
        event={selectedEvent}
        isOpen={detailsOpen}
        onClose={closeDetails}
        showFavorite={false}
        showSignup={false}
      />

      <AddReviewModal
        isOpen={reviewOpen}
        onClose={closeReview}
        ticket={reviewTicket}
        onSubmitted={handleReviewSubmitted}
      />

      <TicketQrModal ticket={qrTicket} isOpen={qrOpen} onClose={closeQr} />
    </Layout>
  );
}

export default MyTicketsPage;
