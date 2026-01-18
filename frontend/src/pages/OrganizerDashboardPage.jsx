import React, { useCallback, useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";

import OrganizerEventRow from "../components/organizer/OrganizerEventRow";
import CreateEventModal from "../components/organizer/CreateEventModal";
import EventDetailsModal from "../components/EventDetailsModal";

import styles from "../styles/OrganizerDashboard.module.css";

export default function OrganizerDashboardPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editOpen, setEditOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [selectedDraft, setSelectedDraft] = useState(null);
  const [selectedDetails, setSelectedDetails] = useState(null);

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
    try {
      const res = await api.get("/api/events/my/");
      setEvents(res.data || []);
    } catch (e) {
      console.error("Eroare la încărcarea evenimentelor mele:", e);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyEvents();
  }, [fetchMyEvents]);

  const openEditDraft = (ev) => {
    setSelectedDraft(ev);
    setEditOpen(true);
  };

  const openDetails = (ev) => {
    // normalizează event pentru modal (ca să apară imaginea/fișierul)
    setSelectedDetails({
      ...ev,
      imageUrl: getMediaUrl(ev?.image),
      fileUrl: getMediaUrl(ev?.file),
      fileName: ev?.file ? String(ev.file).split("/").pop() : null,
      organizerName:
        ev?.organizer?.first_name || ev?.organizer?.last_name
          ? `${ev.organizer?.first_name || ""} ${ev.organizer?.last_name || ""}`.trim()
          : ev?.organizer?.email || ev?.organizer?.username || "Organizator",
      locationName: ev?.location?.name || "Locație necunoscută",
      google_maps_link: ev?.location?.google_maps_link || null,
    });

    setDetailsOpen(true);
  };

  const handleDeleteDraft = async (ev) => {
    if (!window.confirm("Sigur vrei să ștergi acest draft?")) return;

    try {
      await api.delete(`/api/events/${ev.id}/`);
      fetchMyEvents();
    } catch (e) {
      console.error("Eroare la ștergere draft:", e);
      alert("Nu s-a putut șterge draft-ul.");
    }
  };

  const groups = useMemo(() => {
    const by = { draft: [], pending: [], published: [], rejected: [] };

    for (const ev of events) {
      const s = ev?.status || "draft";
      if (by[s]) by[s].push(ev);
      else by.draft.push(ev);
    }

    return by;
  }, [events]);

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Evenimentele mele</h1>
          <p className={styles.subtitle}>
            Draft-urile pot fi editate. Celelalte pot fi doar vizualizate.
          </p>
        </div>

        {loading ? (
          <p>Se încarcă...</p>
        ) : (
          <div className={styles.sections}>
            <Section title="Draft-uri (în lucru)" count={groups.draft.length}>
              {groups.draft.map((ev) => (
                <OrganizerEventRow
                  key={ev.id}
                  event={ev}
                  onEditDraft={openEditDraft}
                  onOpenDetails={openDetails}
                  onDeleteDraft={handleDeleteDraft}
                />
              ))}
            </Section>

            <Section title="În așteptare validare" count={groups.pending.length}>
              {groups.pending.map((ev) => (
                <OrganizerEventRow
                  key={ev.id}
                  event={ev}
                  onEditDraft={openEditDraft}
                  onOpenDetails={openDetails}
                  onDeleteDraft={handleDeleteDraft}
                />
              ))}
            </Section>

            <Section title="Publicate" count={groups.published.length}>
              {groups.published.map((ev) => (
                <OrganizerEventRow
                  key={ev.id}
                  event={ev}
                  onEditDraft={openEditDraft}
                  onOpenDetails={openDetails}
                  onDeleteDraft={handleDeleteDraft}
                />
              ))}
            </Section>

            <Section title="Respinse" count={groups.rejected.length}>
              {groups.rejected.map((ev) => (
                <OrganizerEventRow
                  key={ev.id}
                  event={ev}
                  onEditDraft={openEditDraft}
                  onOpenDetails={openDetails}
                  onDeleteDraft={handleDeleteDraft}
                />
              ))}
            </Section>
          </div>
        )}

        {/* modalele rămân la fel */}
        <CreateEventModal
          isOpen={editOpen}
          onClose={() => {
            setEditOpen(false);
            setSelectedDraft(null);
          }}
          initialEvent={selectedDraft}
          mode="edit"
          onSaved={() => {
            setEditOpen(false);
            setSelectedDraft(null);
            fetchMyEvents();
          }}
        />

        <EventDetailsModal
          isOpen={detailsOpen}
          onClose={() => {
            setDetailsOpen(false);
            setSelectedDetails(null);
          }}
          event={selectedDetails}
          showFavorite={false}
          showSignup={false}
        />
      </div>
    </Layout>
  );
}

function Section({ title, count, children }) {
  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <span className={styles.sectionCount}>{count}</span>
      </div>

      {count === 0 ? (
        <div className={styles.empty}>Niciun eveniment aici.</div>
      ) : (
        <div className={styles.list}>{children}</div>
      )}
    </div>
  );
}