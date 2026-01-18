import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Layout from "../components/Layout";
import QrScanner from "../components/QrScanner";
import api from "../services/api";
import styles from "../styles/OrganizerScan.module.css";

export default function OrganizerScanEventPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusMsg, setStatusMsg] = useState("");
  const [lastResult, setLastResult] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/api/events/my/");
        const found = (res.data || []).find((e) => String(e.id) === String(eventId));
        if (!found) {
          setEvent(null);
          setError("Evenimentul nu există sau nu îți aparține.");
          return;
        }
        setEvent(found);
      } catch (e) {
        console.error(e);
        setError("Nu am putut încărca evenimentul.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [eventId]);

  const canScan = useMemo(() => {
    if (!event) return false;
    if (event.status !== "published") return false;

    const now = new Date();
    const start = event?.start_date ? new Date(event.start_date) : null;
    const end = event?.end_date ? new Date(event.end_date) : null;

    if (end && end < now) return false;

    // permite cu 60 min înainte
    if (start && now < new Date(start.getTime() - 60 * 60 * 1000)) return false;

    return true;
  }, [event]);

  const handleDecode = async (qrText) => {
    if (!event || busy) return;

    setBusy(true);
    setStatusMsg("Verific biletul...");
    setError("");

    try {
      const res = await api.post("/api/interactions/tickets/checkin/", {
        event_id: event.id,
        qr_code_data: qrText,
      });

      setLastResult(res.data);
      setStatusMsg(res.data?.message || "Scanare procesată.");
    } catch (e) {
      console.error(e);
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.qr_code_data ||
        "Scanare eșuată.";
      setStatusMsg("");
      setLastResult(null);
      setError(String(msg));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <button onClick={() => navigate("/organizer/scan")} className={styles.backBtn}>
            Înapoi
          </button>

          <h1 className={styles.title}>Scanare bilete</h1>
          {event ? <p className={styles.subtitle}>{event.title}</p> : null}
        </div>

        {loading && <p>Se încarcă...</p>}
        {!loading && error && <p className={styles.error}>{error}</p>}

        {!loading && event && !canScan && (
          <p className={styles.error}>
            Scanarea nu este disponibilă (eveniment nepublicat / încheiat / prea devreme).
          </p>
        )}

        {!loading && event && canScan && (
          <>
            <p style={{ fontWeight: 700, marginBottom: 8 }}>
              {statusMsg || (busy ? "Procesez..." : "Scanează QR-ul biletului")}
            </p>

            <QrScanner active={true} onStatus={setStatusMsg} onDecode={handleDecode} />

            {lastResult ? (
              <div style={{ marginTop: 12, fontWeight: 800 }}>
                {lastResult?.message || "OK"}
                <div style={{ fontWeight: 600, marginTop: 6 }}>
                  {lastResult?.user_email ? `Student: ${lastResult.user_email}` : null}
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </Layout>
  );
}
