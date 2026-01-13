import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

import Layout from "../components/Layout.jsx";
import styles from "../styles/OrganizerScan.module.css";
import OrganizerScanEventCard from "../components/organizer/OrganizerScanEventCard";

function OrganizerScanPage() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedEvent] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [lastResult, setLastResult] = useState(null);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  const getMediaUrl = useCallback(
    (path) => {
      if (!path) return null;
      const str = String(path);
      if (str.startsWith("http")) return str;

      let clean = str;
      if (!clean.startsWith("/")) clean = `/${clean}`;
      if (!clean.startsWith("/media")) return `${API_BASE_URL}/media${clean}`;
      return `${API_BASE_URL}${clean}`;
    },
    [API_BASE_URL]
  );

  const fetchMyEvents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/events/my/");
      setEvents(res.data || []);
    } catch (e) {
      console.error("Eroare la încărcarea evenimentelor organizatorului:", e);
      setEvents([]);
      setError("Nu am putut încărca evenimentele.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyEvents();
  }, [fetchMyEvents]);

  const activePublishedEvents = useMemo(() => {
    const now = new Date();

    const enriched = (events || []).map((ev) => {
      const start = ev?.start_date ? new Date(ev.start_date) : null;
      const end = ev?.end_date ? new Date(ev.end_date) : null;

      const isEnded = end ? end < now : false; 
      const isUpcoming = start ? start > now : false;
      const isOngoing = start ? start <= now && !isEnded : !isEnded;

      const state = isEnded
        ? "ended"
        : isUpcoming
        ? "upcoming"
        : isOngoing
        ? "ongoing"
        : "upcoming";

      return {
        ...ev,
        __state: state,
        __startTs: start?.getTime?.() ?? 0,
        __endTs: end?.getTime?.() ?? 0,
      };
    });

    return enriched
      .filter((ev) => ev?.status === "published")
      .filter((ev) => ev?.__state !== "ended")
      .sort((a, b) => (a.__startTs || 0) - (b.__startTs || 0));
  }, [events]);

  const onScanEvent = (ev) => {
    navigate(`/organizer/scan/${ev.id}`);
  };

  const handleDecode = async (qrText) => {

    const res = await api.post("/api/interactions/tickets/checkin/", {
      event_id: selectedEvent.id,
      qr_code_data: qrText,
    });

    setLastResult(res.data);
    setStatusMsg(res.data?.message || "Scanare procesată.");
  };

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Scanare bilete</h1>
          <p className={styles.subtitle}>
            Alege un eveniment publicat (neîncheiat) și pornește scanarea.
          </p>
        </div>

        {loading && <p>Se încarcă evenimentele...</p>}
        {!loading && error && <p className={styles.error}>{error}</p>}

        {selectedEvent ? (
          <>
            <h2>{selectedEvent.title}</h2>
            <p style={{ fontWeight: 700, color: "#666" }}>{statusMsg}</p>

            <QrScanner
              active={true}
              onStatus={setStatusMsg}
              onDecode={handleDecode}
            />

            {lastResult ? (
              <div style={{ marginTop: 12, fontWeight: 800 }}>
                {lastResult?.message || "OK"}
              </div>
            ) : null}
          </>
        ) : null}

        {!loading && !error && (
          <>
            {activePublishedEvents.length ? (
              <div className={styles.list}>
                {activePublishedEvents.map((ev) => (
                  <OrganizerScanEventCard
                    key={ev.id}
                    event={ev}
                    getMediaUrl={getMediaUrl}
                    onScan={() => onScanEvent(ev)}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.empty}>
                Nu ai evenimente publicate care să nu fie încheiate.
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

export default OrganizerScanPage;