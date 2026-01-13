import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import EventCard from "../components/EventCard";
import SearchBar from "../components/SearchBar";
import FilterDropdown from "../components/FilterDropdown";
import api from "../services/api";

function OrganizerHomePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);

  const [filters, setFilters] = useState({
    q: "",
    day: "",
    date: "",
    facultyId: "",
    departmentId: "",
    categoryId: "",
    locationQuery: "",
  });

  // când se schimbă faculty -> reset department
  useEffect(() => {
    setFilters((p) => ({ ...p, departmentId: "" }));
  }, [filters.facultyId]);

  // 1) încarcă meta (facultăți/departamente/categorii)
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [f, d, c] = await Promise.all([
          api.get("/api/events/faculties/"),
          api.get("/api/events/departments/"),
          api.get("/api/events/categories/"),
        ]);
        setFaculties(f.data || []);
        setDepartments(d.data || []);
        setCategories(c.data || []);
      } catch (e) {
        console.error("Eroare la încărcarea listelor:", e);
      }
    };

    fetchMeta();
  }, []);

  // 2) query către backend doar pentru ce suportă backend-ul
  const buildQuery = (f) => {
    const params = new URLSearchParams();

    if (f.q?.trim()) params.set("search", f.q.trim());
    if (f.facultyId) params.set("faculty", f.facultyId);
    if (f.categoryId) params.set("category", f.categoryId);

    return params.toString();
  };

  // 3) re-fetch evenimente când se schimbă q/faculty/category
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);

      try {
        const qs = buildQuery(filters);
        const url = qs ? `/api/events/?${qs}` : "/api/events/";
        const response = await api.get(url);
        setEvents(response.data || []);
      } catch (err) {
        console.error("Eroare:", err);
        setError("Nu am putut încărca evenimentele.");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.q, filters.facultyId, filters.categoryId]);

  // 4) filtre client-side (department, locație, day/date)
  const getFilteredEvents = () => {
    const isSameDay = (dateObj, yyyyMmDd) => {
      if (!yyyyMmDd) return false;
      const [y, m, d] = yyyyMmDd.split("-").map(Number);
      return (
        dateObj.getFullYear() === y &&
        dateObj.getMonth() === m - 1 &&
        dateObj.getDate() === d
      );
    };

    const makeYMD = (dt) => {
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, "0");
      const d = String(dt.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    };

    return events.filter((ev) => {
      // department
      if (filters.departmentId) {
        const depId = ev.department?.id ? String(ev.department.id) : "";
        if (depId !== String(filters.departmentId)) return false;
      }

      // locație
      if (filters.locationQuery?.trim()) {
        const q = filters.locationQuery.trim().toLowerCase();
        const locName = (ev.location?.name || "").toLowerCase();
        if (!locName.includes(q)) return false;
      }

      // zi
      if (filters.day) {
        const start = ev.start_date ? new Date(ev.start_date) : null;
        if (!start || Number.isNaN(start.getTime())) return false;

        if (filters.day === "today") {
          const today = new Date();
          if (!isSameDay(start, makeYMD(today))) return false;
        }

        if (filters.day === "date") {
          if (!filters.date) return false;
          if (!isSameDay(start, filters.date)) return false;
        }
      }

      return true;
    });
  };

  const filtered = getFilteredEvents();

  return (
    <Layout>
      <div style={{ padding: "0rem" }}>
        <div style={{ marginBottom: "1.25rem" }}>
          <h1 style={{ fontSize: "2rem", color: "#2d3748", marginBottom: "0.5rem" }}>
            Panou Organizator
          </h1>
          <p style={{ color: "#718096" }}>
            Caută și filtrează evenimentele existente (fără favorite/înscriere).
          </p>
        </div>

        {/* SEARCH + FILTERS BAR */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            marginBottom: "18px",
          }}
        >
          <SearchBar
            value={filters.q}
            onChange={(v) => setFilters((p) => ({ ...p, q: v }))}
            placeholder="Caută după titlu sau descriere..."
          />

          <FilterDropdown
            filters={filters}
            onChange={setFilters}
            faculties={faculties}
            departments={departments}
            categories={categories}
          />
        </div>

        {loading && <p>Se încarcă evenimentele...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "2rem",
            }}
          >
            {filtered.length > 0 ? (
              filtered.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  showFavorite={false}
                  showSignup={false}
                />
              ))
            ) : (
              <p>Nu există evenimente pentru filtrele alese.</p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default OrganizerHomePage;