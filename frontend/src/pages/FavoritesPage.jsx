import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import EventCard from "../components/EventCard";
import api from "../services/api";

import styles from "../styles/Favorites.module.css";

function FavoritesPage() {
  const [favorites, setFavorites] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [ticketsMap, setTicketsMap] = useState({});

  const fetchFavorites = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/api/interactions/favorites/");
      setFavorites(res.data || []);
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401) {
        setError("Trebuie să fii autentificat ca să vezi favoritele.");
      } else {
        setError("Nu am putut încărca favoritele.");
      }
      setFavorites([]);
      console.error("Eroare la încărcarea favoritelor:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await api.get("/api/interactions/tickets/");
      const map = {};
      (res.data || []).forEach((t) => {
        const evId = t?.event?.id ?? t?.event;
        if (evId) map[String(evId)] = true;
      });
      setTicketsMap(map);
    } catch (e) {
      if (e?.response?.status !== 401) console.error("Eroare tickets:", e);
      setTicketsMap({});
    }
  };

  useEffect(() => {
    fetchFavorites();
    fetchTickets();
  }, []);

  // map eventId -> favoriteId (pk) 
  const favoritesMap = useMemo(() => {
    const map = {};
    (favorites || []).forEach((fav) => {
      const evId = fav?.event?.id ?? fav?.event;
      if (evId) map[String(evId)] = fav.id;
    });
    return map;
  }, [favorites]);

  const favoriteEvents = useMemo(() => {
    return (favorites || []).map((fav) => fav?.event).filter(Boolean);
  }, [favorites]);

  const toggleFavorite = async (eventId) => {
    const key = String(eventId);
    const favId = favoritesMap[key];

    try {
      if (favId) {
        await api.delete(`/api/interactions/favorites/${favId}/`);

        // scoatem din listă favorit-ul șters
        setFavorites((prev) =>
          (prev || []).filter((f) => String(f?.id) !== String(favId))
        );
      } else {
        const res = await api.post("/api/interactions/favorites/", {
          event_id: eventId,
        });
        const created = res.data;
        if (created?.id) setFavorites((prev) => [created, ...(prev || [])]);
      }
    } catch (e) {
      console.error("Eroare la toggle favorite:", e);
    }
  };

  const handleTicketCreated = (eventId) => {
    const key = String(eventId);

    setTicketsMap((prev) => ({ ...prev, [key]: true }));

    setFavorites((prev) =>
      (prev || []).map((fav) => {
        const ev = fav?.event;
        if (!ev || String(ev.id) !== key) return fav;
        return {
          ...fav,
          event: { ...ev, tickets_count: (ev.tickets_count || 0) + 1 },
        };
      })
    );
  };

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Favorite</h1>
          <p className={styles.subtitle}>
            Evenimentele pe care le-ai salvat pentru mai târziu.
          </p>
        </div>

        {loading && <p>Se încarcă favoritele...</p>}
        {!loading && error && <p className={styles.error}>{error}</p>}

        {!loading && !error && (
          <>
            {favoriteEvents.length > 0 ? (
              <div className={styles.grid}>
                {favoriteEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isFavorite={true}
                    onToggleFavorite={() => toggleFavorite(event.id)}
                    showFavorite={true}
                    showSignup={true}
                    hasTicket={Boolean(ticketsMap[String(event.id)])}
                    onTicketCreated={handleTicketCreated}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.empty}>
                Nu ai încă evenimente favorite.
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

export default FavoritesPage;