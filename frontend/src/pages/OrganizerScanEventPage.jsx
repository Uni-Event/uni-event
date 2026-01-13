import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";
import styles from "../styles/OrganizerScan.module.css";

export default function OrganizerScanEventPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    const end = event?.end_date ? new Date(event.end_date) : null;

    if (end && end < now) return false;

    return true;
  }, [event]);

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Scanare bilete</h1>
          <p className={styles.subtitle}>
            {event?.title ? `Eveniment: ${event.title}` : "Selectează un eveniment"}
          </p>
        </div>

        <button
          className={styles.secondaryBtn}
          type="button"
          onClick={() => navigate("/organizer/scan")}
        >
          Înapoi la listă
        </button>

        {loading && <p>Se încarcă...</p>}
        {!loading && error && <p className={styles.error}>{error}</p>}

        {!loading && !error && event && (
          <>
            {!canScan ? (
              <div className={styles.empty}>
                Scanarea nu este disponibilă pentru acest eveniment (nepublicat sau încheiat).
              </div>
            ) : (
              <div className={styles.empty}>
                {/* Componenta de scanare QR */}
                Scanner placeholder — componenta QR scanner + card rezultat.
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
