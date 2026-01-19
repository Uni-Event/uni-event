import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "../../styles/CreateEvent.module.css";

// --- Servicii ---
import api from "../../services/api";

// --- Harta ---
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- Icons (Feather) ---
import {
  FiArrowRight,
  FiCalendar,
  FiCheckCircle,
  FiFileText,
  FiImage,
  FiInfo,
  FiLink,
  FiMapPin,
  FiRotateCcw,
  FiSave,
  FiX,
} from "react-icons/fi";

// --- Leaflet marker assets ---
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const LocationMarker = ({ position, setPosition, handleAddressFetch }) => {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      handleAddressFetch(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : <Marker position={position}></Marker>;
};

const defaultLat = 47.6426;
const defaultLng = 26.2547;

const INITIAL_DATA = {
  title: "",
  seats: "",
  description: "",
  startDate: "",
  endDate: "",
  category: "",
  faculty: "",
  department: "",
  locationName: "",
  locationAddress: "",
  googleMapsLink: "",
  lat: defaultLat,
  lng: defaultLng,
  coverImage: null,
  document: null,
};

const CreateEventModal = ({ isOpen, onClose, initialEvent = null }) => {
  // --- Liste dropdown/radio ---
  const [facultiesList, setFacultiesList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);

  // --- Form state ---
  const [formData, setFormData] = useState(INITIAL_DATA);
  const [markerPosition, setMarkerPosition] = useState({
    lat: defaultLat,
    lng: defaultLng,
  });
  const [errors, setErrors] = useState({});

  // --- Refs pentru scroll la primul câmp cu eroare ---
  const refs = {
    title: useRef(null),
    description: useRef(null),
    category: useRef(null),
    start_date: useRef(null),
    end_date: useRef(null),
    location_name: useRef(null),
    location_address: useRef(null),
    max_participants: useRef(null),
  };

  // Populate form la open/edit
  useEffect(() => {
    if (!isOpen) return;

    if (initialEvent) {
      setFormData({
        ...INITIAL_DATA,

        title: initialEvent.title || "",
        seats: initialEvent.max_participants ?? "",
        description: initialEvent.description || "",

        startDate: initialEvent.start_date
          ? String(initialEvent.start_date).slice(0, 16)
          : "",
        endDate: initialEvent.end_date
          ? String(initialEvent.end_date).slice(0, 16)
          : "",

        category: initialEvent.category?.id
          ? String(initialEvent.category.id)
          : "",
        faculty: initialEvent.faculty?.id
          ? String(initialEvent.faculty.id)
          : "",
        department: initialEvent.department?.id
          ? String(initialEvent.department.id)
          : "",

        locationName: initialEvent.location?.name || "",
        locationAddress: initialEvent.location?.address || "",
        googleMapsLink: initialEvent.location?.google_maps_link || "",

        coverImage: null,
        document: null,
      });
    } else {
      setFormData(INITIAL_DATA);
    }

    setMarkerPosition({ lat: defaultLat, lng: defaultLng });
    setErrors({});
  }, [isOpen, initialEvent]);

  // Scroll la primul error
  useEffect(() => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length === 0) return;

    const firstErrorKey = errorKeys[0];
    const ref = refs[firstErrorKey];

    if (ref?.current) {
      ref.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      if (typeof ref.current.focus === "function") {
        ref.current.focus();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errors]);

  // Fetch dropdown data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [facRes, deptRes, catRes] = await Promise.all([
          api.get("api/events/faculties/"),
          api.get("api/events/departments/"),
          api.get("api/events/categories/"),
        ]);

        setFacultiesList(facRes.data);
        setDepartmentsList(deptRes.data);
        setCategoriesList(catRes.data);
      } catch (error) {
        console.error(
          "Nu am putut încărca listele (facultăți/categorii):",
          error
        );
      }
    };

    if (isOpen) fetchData();
  }, [isOpen]);

  //  lock scroll cât timp modalul e deschis
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Filtrăm departamentele în funcție de facultatea selectată
  const filteredDepartments = departmentsList.filter((dept) => {
    return dept.faculty && dept.faculty.id === parseInt(formData.faculty);
  });

  // Helpers
  const fetchAddress = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );

      const data = await response.json();
      const gMapsLink = `https://www.google.com/maps?q=${lat},${lng}`;

      setFormData((prev) => ({
        ...prev,
        locationAddress: data.display_name || "",
        googleMapsLink: gMapsLink,
        lat: lat,
        lng: lng,
      }));
    } catch (error) {
      console.error("Eroare la preluarea adresei:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      if (name === "faculty") {
        newData.department = "";
      }

      return newData;
    });
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, [type]: file }));
  };

  const handleReset = () => {
    if (window.confirm("Sigur resetezi toate câmpurile?")) {
      setFormData(INITIAL_DATA);
      setMarkerPosition({ lat: defaultLat, lng: defaultLng });
    }
  };

  // Validare form
  const validateForm = (statusType) => {
    const nextErrors = {};

    const title = (formData.title || "").trim();
    const description = (formData.description || "").trim();
    const locationName = (formData.locationName || "").trim();
    const locationAddress = (formData.locationAddress || "").trim();

    const seats = Number(formData.seats);

    if (!Number.isFinite(seats) || seats < 1) {
      nextErrors.max_participants =
        "Numărul de locuri trebuie să fie cel puțin 1.";
    }

    if (statusType === "pending") {
      if (title.length < 5)
        nextErrors.title = "Titlul trebuie să aibă cel puțin 5 caractere.";

      if (description.length < 5)
        nextErrors.description =
          "Descrierea trebuie să aibă cel puțin 5 caractere.";

      if (!formData.category)
        nextErrors.category =
          "Categoria este obligatorie pentru publicare/validare.";

      if (!locationName)
        nextErrors.location_name = "Numele locației este obligatoriu.";

      if (!locationAddress)
        nextErrors.location_address =
          "Adresa este obligatorie pentru publicare/validare.";

      const start = formData.startDate ? new Date(formData.startDate) : null;
      const end = formData.endDate ? new Date(formData.endDate) : null;

      if (!start || isNaN(start.getTime())) {
        nextErrors.start_date = "Data de început este obligatorie.";
      } else if (start.getTime() < Date.now() - 60 * 1000) {
        nextErrors.start_date = "Data de început nu poate fi în trecut.";
      }

      if (!end || isNaN(end.getTime())) {
        nextErrors.end_date = "Data de sfârșit este obligatorie.";
      } else if (
        start &&
        !isNaN(start.getTime()) &&
        end.getTime() <= start.getTime()
      ) {
        nextErrors.end_date =
          "Data de sfârșit trebuie să fie după data de început.";
      }
    }

    return nextErrors;
  };

  // Trimitere date (draft / pending)
  const sendEventData = async (statusType) => {
    setErrors({});
    const localErrors = validateForm(statusType);
    setErrors(localErrors);

    if (Object.keys(localErrors).length > 0) {
      return;
    }

    const data = new FormData();

    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("max_participants", formData.seats);
    data.append("start_date", formData.startDate);
    data.append("end_date", formData.endDate);
    data.append("status", statusType);

    data.append("location_name", formData.locationName);
    data.append("location_address", formData.locationAddress);
    if (formData.googleMapsLink)
      data.append("google_maps_link", formData.googleMapsLink);

    if (formData.faculty) data.append("faculty", formData.faculty);
    if (formData.department) data.append("department", formData.department);
    if (formData.category) data.append("category", formData.category);

    if (formData.coverImage) data.append("image", formData.coverImage);
    if (formData.document) data.append("file", formData.document);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("Nu ești autentificat!");
        return;
      }

      const response = initialEvent
        ? await api.patch(`/api/events/${initialEvent.id}/`, data)
        : await api.post("/api/events/", data);

      console.log("Eveniment creat:", response.data);

      if (statusType === "draft") {
        alert(
          "Ciorna a fost salvată cu succes!\nO poți edita ulterior din profilul tău."
        );
      } else {
        alert(
          "Evenimentul a fost trimis cu succes!\nAcesta va fi vizibil pe site doar după ce este validat de un administrator."
        );
      }

      onClose?.();
    } catch (error) {
      console.error("Eroare:", error);

      if (error.response && error.response.data) {
        const server = error.response.data;

        const normalized = {};
        Object.entries(server).forEach(([key, val]) => {
          if (Array.isArray(val)) normalized[key] = val[0];
          else if (typeof val === "string") normalized[key] = val;
          else normalized[key] = JSON.stringify(val);
        });

        setErrors(normalized);
        alert("Nu s-a putut salva evenimentul. Verifică câmpurile marcate.");
        return;
      }

      alert("A apărut o eroare de conexiune. Verifică dacă serverul e pornit.");
    }
  };

  const handleSaveDraft = (e) => {
    e.preventDefault();
    sendEventData("draft");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendEventData("pending");
  };

  if (!isOpen) return null;

  const modal = (
    <div
      className={styles.modalOverlay}
      onMouseDown={onClose} // click pe overlay -> close
      role="dialog"
      aria-modal="true"
    >
      <div
        className={styles.modalContent}
        onMouseDown={(e) => e.stopPropagation()} // click în card -> nu close
      >
        {/* Close */}
        <button className={styles.closeButton} onClick={onClose} type="button">
          <FiX />
        </button>

        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Creează Eveniment</h2>
          <p className={styles.subtitle}>
            Completează detaliile pentru a publica un nou eveniment în rețea.
          </p>
        </div>

        <hr className={styles.thickDivider} />

        <form onSubmit={handleSubmit} className={styles.formGroup}>
          {/* --- 1. GENERAL --- */}
          <div className={styles.sectionBlock}>
            <div className={styles.sectionTitle}>
              <FiInfo /> Detalii Generale
            </div>

            <div className={styles.row}>
              <div className={styles.colWide}>
                <label className={styles.label}>Titlu Eveniment</label>
                <input
                  ref={refs.title}
                  type="text"
                  name="title"
                  placeholder="ex. Hackathon Suceava"
                  className={styles.input}
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
                {errors.title && (
                  <div className={styles.fieldError}>{errors.title}</div>
                )}
              </div>

              <div className={styles.colNarrow}>
                <label className={styles.label}>Locuri Disp.</label>
                <input
                  type="number"
                  name="seats"
                  placeholder="0"
                  className={styles.input}
                  value={formData.seats}
                  onChange={handleChange}
                  required
                />
                {errors.max_participants && (
                  <div className={styles.fieldError}>
                    {errors.max_participants}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.col}>
              <label className={styles.label}>Descriere & Agendă</label>
              <textarea
                ref={refs.description}
                name="description"
                placeholder="Despre ce este evenimentul..."
                className={styles.textarea}
                value={formData.description}
                onChange={handleChange}
                required
              ></textarea>
              {errors.description && (
                <div className={styles.fieldError}>{errors.description}</div>
              )}
            </div>

            <div className={styles.col}>
              <label className={styles.label}>Categorie</label>

              <div ref={refs.category} className={styles.categoriesWrapper}>
                {categoriesList.length > 0 ? (
                  categoriesList.map((cat) => (
                    <label key={cat.id} className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="category"
                        value={cat.id}
                        checked={parseInt(formData.category) === cat.id}
                        onChange={handleChange}
                        className={styles.radioInput}
                      />
                      {cat.name}
                    </label>
                  ))
                ) : (
                  <p style={{ fontSize: "0.8rem", color: "red" }}>
                    Nicio categorie disponibilă.
                  </p>
                )}
              </div>

              {errors.category && (
                <div className={styles.fieldError}>{errors.category}</div>
              )}
            </div>
          </div>

          {/* --- 2. DATA --- */}
          <div className={styles.sectionBlock}>
            <div className={styles.sectionTitle}>
              <FiCalendar /> Programare
            </div>

            <div className={styles.row}>
              <div className={styles.col}>
                <label className={styles.label}>Începe la</label>
                <input
                  ref={refs.start_date}
                  type="datetime-local"
                  name="startDate"
                  className={styles.input}
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
                {errors.start_date && (
                  <div className={styles.fieldError}>{errors.start_date}</div>
                )}
              </div>

              <div className={styles.col}>
                <label className={styles.label}>Se termină la</label>
                <input
                  type="datetime-local"
                  name="endDate"
                  className={styles.input}
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
                {errors.end_date && (
                  <div className={styles.fieldError}>{errors.end_date}</div>
                )}
              </div>
            </div>
          </div>

          {/* --- 3. ACADEMIC --- */}
          <div className={styles.sectionBlock}>
            <div className={styles.sectionTitle}>
              <FiCheckCircle /> Afiliere
            </div>

            <div className={styles.row}>
              <div className={styles.col}>
                <label className={styles.label}>
                  Facultate <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  name="faculty"
                  className={styles.select}
                  value={formData.faculty}
                  onChange={handleChange}
                  required
                >
                  <option value="">Alege...</option>
                  {facultiesList.map((fac) => (
                    <option key={fac.id} value={fac.id}>
                      {fac.name} ({fac.abbreviation})
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.col}>
                <label className={styles.label}>Departament</label>
                <select
                  name="department"
                  className={styles.select}
                  value={formData.department}
                  onChange={handleChange}
                  disabled={!formData.faculty}
                >
                  <option value="">Opțional...</option>

                  {filteredDepartments.length > 0
                    ? filteredDepartments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))
                    : formData.faculty && (
                        <option disabled>
                          Această facultate nu are departamente definite.
                        </option>
                      )}
                </select>
              </div>
            </div>
          </div>

          {/* --- 4. MEDIA --- */}
          <div className={styles.sectionBlock}>
            <div className={styles.sectionTitle}>
              <FiImage /> Media & Fișiere
            </div>

            <div className={styles.uploadContainer}>
              <label className={styles.uploadBox}>
                <FiImage size={32} />
                <span className={styles.uploadText}>
                  {formData.coverImage
                    ? formData.coverImage.name
                    : "Adaugă Copertă (JPG)"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => handleFileChange(e, "coverImage")}
                />
              </label>

              <label className={styles.uploadBox}>
                <FiFileText size={32} />
                <span className={styles.uploadText}>
                  {formData.document ? formData.document.name : "Atașează PDF"}
                </span>
                <input
                  type="file"
                  accept=".pdf"
                  hidden
                  onChange={(e) => handleFileChange(e, "document")}
                />
              </label>
            </div>
          </div>

          {/* --- 5. LOCATIE --- */}
          <div className={styles.sectionBlockMap}>
            <div className={styles.sectionTitle}>
              <FiMapPin /> Localizare
            </div>

            <div className={styles.row}>
              <div className={styles.colWide}>
                <label className={styles.label}>Nume Locație / Sală</label>
                <input
                  type="text"
                  name="locationName"
                  placeholder="Ex: Aula Corp A"
                  className={styles.input}
                  value={formData.locationName}
                  onChange={handleChange}
                  required
                />
                {errors.location_name && (
                  <div className={styles.fieldError}>
                    {errors.location_name}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.locationSection}>
              <div className={styles.col}>
                <label className={styles.label}>Adresă (Editabilă)</label>
                <input
                  type="text"
                  name="locationAddress"
                  placeholder="Scrie adresa manual SAU selectează pe hartă..."
                  className={styles.input}
                  value={formData.locationAddress}
                  onChange={handleChange}
                />
                {errors.location_address && (
                  <div className={styles.fieldError}>
                    {errors.location_address}
                  </div>
                )}
              </div>

              <div className={styles.mapContainer}>
                <MapContainer
                  center={[defaultLat, defaultLng]}
                  zoom={14}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="© OpenStreetMap"
                  />

                  <LocationMarker
                    position={markerPosition}
                    setPosition={setMarkerPosition}
                    handleAddressFetch={fetchAddress}
                  />
                </MapContainer>
              </div>

              {formData.googleMapsLink && (
                <div className={styles.coordsText}>
                  <FiLink />
                  <a
                    href={formData.googleMapsLink}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: "#8a56d1",
                      textDecoration: "none",
                      fontWeight: 600,
                    }}
                  >
                    Vezi link Google Maps
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* FOOTER */}
          <div className={styles.footer}>
            <button
              type="button"
              className={styles.resetBtn}
              onClick={handleReset}
            >
              <FiRotateCcw /> Resetează
            </button>

            <div className={styles.rightButtons}>
              <button
                type="button"
                className={styles.draftBtn}
                onClick={handleSaveDraft}
              >
                <FiSave /> Salvează Ciornă
              </button>

              <button type="submit" className={styles.submitBtn}>
                Publică <FiArrowRight />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  // PORTAL: modalul se mută în <body>, deci e mereu peste navbar/layout
  return createPortal(modal, document.body);
};

export default CreateEventModal;
