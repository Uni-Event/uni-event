import React, { useCallback, useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import styles from "../styles/OrganizerStatistics.module.css";

import StatsEventCard from "../components/organizer/StatsEventCard";
import EventStatsPanel from "../components/organizer/EventStatsPanel";

export default function OrganizerStatisticsPage() {
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const [selected, setSelected] = useState(null);

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState("");

  const fetchMyEvents = useCallback(async () => {
    setLoadingEvents(true);
    try {
      const res = await api.get("/api/events/my/");
      setEvents(res.data || []);
    } catch (e) {
      console.error("Eroare la /api/events/my/:", e);
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  useEffect(() => {
    fetchMyEvents();
  }, [fetchMyEvents]);

  const endedEvents = useMemo(() => {
    const now = new Date();
    return (events || [])
      .filter((ev) => ev?.status === "published")
      .filter((ev) => {
        const end = ev?.end_date ? new Date(ev.end_date) : null;
        return end ? end < now : false;
      })
      .sort((a, b) => new Date(b.end_date) - new Date(a.end_date));
  }, [events]);

  const loadStats = useCallback(async (ev) => {
    if (!ev?.id) return;

    setSelected(ev);
    setStats(null);
    setStatsError("");
    setLoadingStats(true);

    try {
      const res = await api.get(`/api/events/${ev.id}/stats/`);
      setStats(res.data);
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        "Nu am putut încărca statisticile.";
      setStatsError(String(msg));
    } finally {
      setLoadingStats(false);
    }
  }, []);

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Statistici</h1>
          <p className={styles.subtitle}>
            Statistici pentru evenimentele terminate.
          </p>
        </div>

        {loadingEvents ? (
          <p>Se încarcă evenimentele…</p>
        ) : (
          <div className={styles.grid}>
            <div className={styles.left}>
              <div className={styles.sectionTitle}>Evenimente terminate</div>

              {endedEvents.length ? (
                <div className={styles.list}>
                  {endedEvents.map((ev) => (
                    <StatsEventCard
                      key={ev.id}
                      event={ev}
                      selected={String(selected?.id) === String(ev.id)}
                      onSelect={() => loadStats(ev)}
                    />
                  ))}
                </div>
              ) : (
                <div className={styles.empty}>
                  Nu ai evenimente terminate încă.
                </div>
              )}
            </div>

            <div className={styles.right}>
              {selected ? (
                <EventStatsPanel
                  event={selected}
                  stats={stats}
                  loading={loadingStats}
                  error={statsError}
                />
              ) : (
                <div className={styles.placeholder}>
                  Selectează un eveniment din stânga ca să vezi statisticile.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}