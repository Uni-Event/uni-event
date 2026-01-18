import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "../styles/FilterDropdown.module.css";
import {
  FiFilter,
  FiX,
  FiCalendar,
  FiMapPin,
  FiBookOpen,
  FiLayers,
} from "react-icons/fi";

const FilterDropdown = ({
  filters,
  onChange,
  faculties = [],
  departments = [],
  categories = [],
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const filteredDepartments = useMemo(() => {
    if (!filters.facultyId) return departments;
    return departments.filter(
      (d) => String(d.faculty?.id) === String(filters.facultyId)
    );
  }, [departments, filters.facultyId]);

  const hasActiveFilters = Boolean(
    filters.day ||
      filters.date ||
      filters.facultyId ||
      filters.departmentId ||
      filters.categoryId ||
      (filters.locationQuery && filters.locationQuery.trim())
  );

  const setFilter = (patch) => {
    onChange((prev) => ({ ...prev, ...patch }));
  };

  const resetFilters = () => {
    onChange((prev) => ({
      ...prev,
      day: "",
      date: "",
      facultyId: "",
      departmentId: "",
      categoryId: "",
      locationQuery: "",
    }));
  };

  useEffect(() => {
    const onDocMouseDown = (e) => {
      if (!open) return;
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    };

    const onKeyDown = (e) => {
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!filters.departmentId) return;
    const stillValid = filteredDepartments.some(
      (d) => String(d.id) === String(filters.departmentId)
    );
    if (!stillValid) setFilter({ departmentId: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.facultyId]);

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        className={`${styles.trigger} ${
          hasActiveFilters ? styles.triggerActive : ""
        }`}
        onClick={() => setOpen((v) => !v)}
      >
        <FiFilter />
        Filtre
        {hasActiveFilters ? <span className={styles.dot} /> : null}
      </button>

      {open && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>Filtrare</div>

            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => setOpen(false)}
              aria-label="Închide"
            >
              <FiX />
            </button>
          </div>

          <div className={styles.grid}>
            {/* Ziua */}
            <div className={styles.field}>
              <div className={styles.label}>
                <FiCalendar className={styles.labelIcon} />
                Ziua
              </div>

              <select
                className={styles.select}
                value={filters.day}
                onChange={(e) => {
                  const day = e.target.value;
                  setFilter({ day, date: day === "date" ? filters.date : "" });
                }}
              >
                <option value="">Oricând</option>
                <option value="today">Astăzi</option>
                <option value="date">Alege o dată…</option>
              </select>

              {filters.day === "date" && (
                <input
                  type="date"
                  className={styles.input}
                  value={filters.date || ""}
                  onChange={(e) => setFilter({ date: e.target.value })}
                />
              )}
            </div>

            {/* Locație (doar nume) */}
            <div className={styles.field}>
              <div className={styles.label}>
                <FiMapPin className={styles.labelIcon} />
                Locație (nume)
              </div>

              <input
                type="text"
                className={styles.input}
                placeholder="Ex: Aula, Sala Sport..."
                value={filters.locationQuery || ""}
                onChange={(e) => setFilter({ locationQuery: e.target.value })}
              />
            </div>

            {/* Facultate */}
            <div className={styles.field}>
              <div className={styles.label}>
                <FiBookOpen className={styles.labelIcon} />
                Facultate
              </div>

              <select
                className={styles.select}
                value={filters.facultyId}
                onChange={(e) =>
                  setFilter({ facultyId: e.target.value, departmentId: "" })
                }
              >
                <option value="">Toate</option>
                {faculties.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.abbreviation ? `${f.abbreviation} — ${f.name}` : f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Departament */}
            <div className={styles.field}>
              <div className={styles.label}>
                <FiBookOpen className={styles.labelIcon} />
                Departament
              </div>

              <select
                className={styles.select}
                value={filters.departmentId}
                onChange={(e) => setFilter({ departmentId: e.target.value })}
                disabled={!filters.facultyId}
              >
                <option value="">Toate</option>
                {filteredDepartments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>

              {!filters.facultyId && (
                <div className={styles.hint}>
                  Alege o facultate ca să restrângi departamentele.
                </div>
              )}
            </div>

            {/* Categorie */}
            <div className={styles.fieldWide}>
              <div className={styles.label}>
                <FiLayers className={styles.labelIcon} />
                Categorie
              </div>

              <select
                className={styles.select}
                value={filters.categoryId}
                onChange={(e) => setFilter({ categoryId: e.target.value })}
              >
                <option value="">Toate</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.resetBtn}
              onClick={resetFilters}
              disabled={!hasActiveFilters}
            >
              Resetează
            </button>

            <button
              type="button"
              className={styles.applyBtn}
              onClick={() => setOpen(false)}
            >
              Aplică
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
