import React, { useState, useEffect } from "react";
import styles from "../../styles/CreateEvent.module.css";

// --- Servicii ---
import api from "../../services/api";

// --- Harta ---
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- Icons (Feather) ---
import {
  FiX,
  FiInfo,
  FiCalendar,
  FiMapPin,
  FiImage,
  FiFileText,
  FiRotateCcw,
  FiSave,
  FiCheckCircle,
  FiLink,
  FiArrowRight,
} from "react-icons/fi";

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

const CreateEventModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [facultiesList, setFacultiesList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);

  // --- SETUP SUCEAVA DEFAULT ---
  const defaultLat = 47.6426;
  const defaultLng = 26.2547;

  const initialData = {
    title: "",
    seats: "",
    description: "",
    startDate: "",
    endDate: "",
    category: "", // ID-ul categoriei
    faculty: "", // ID-ul facultății
    department: "", // ID-ul departamentului
    locationName: "",
    locationAddress: "",
    googleMapsLink: "",
    lat: defaultLat,
    lng: defaultLng,
    coverImage: null,
    document: null,
  };

  const [formData, setFormData] = useState(initialData);
  const [markerPosition, setMarkerPosition] = useState({
    lat: defaultLat,
    lng: defaultLng,
  });

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

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  // Filtrăm departamentele în funcție de facultatea selectată
  const filteredDepartments = departmentsList.filter((dept) => {
    return dept.faculty && dept.faculty.id === parseInt(formData.faculty);
  });

  const fetchAddress = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      // Generăm un link valid de Google Maps
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

      // Dacă utilizatorul schimbă facultatea, resetăm departamentul selectat anterior
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
      setFormData(initialData);
      setMarkerPosition({ lat: defaultLat, lng: defaultLng });
    }
  };

  // --- FUNCȚIA PRINCIPALĂ DE TRIMITERE A DATELOR ---
  const sendEventData = async (statusType) => {
    // 1. Construim FormData
    const data = new FormData();

    // Câmpuri text directe
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("max_participants", formData.seats);
    data.append("start_date", formData.startDate);
    data.append("end_date", formData.endDate);
    data.append("status", statusType);

    // Locație
    data.append("location_name", formData.locationName);
    data.append("location_address", formData.locationAddress);
    if (formData.googleMapsLink) {
      data.append("google_maps_link", formData.googleMapsLink);
    }

    // Chei Străine
    if (formData.faculty) data.append("faculty", formData.faculty);
    if (formData.department) data.append("department", formData.department);
    if (formData.category) data.append("category", formData.category);

    // Fișiere
    if (formData.coverImage) data.append("image", formData.coverImage);
    if (formData.document) data.append("file", formData.document);

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        alert("Nu ești autentificat!");
        return;
      }

      const response = await api.post("/api/events/", data);

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

      onClose();
    } catch (error) {
      console.error("Eroare:", error);

      if (error.response) {
        alert(
          `Eroare server (${error.response.status}):\n` +
            JSON.stringify(error.response.data, null, 2)
        );
      } else {
        alert(
          "A apărut o eroare de conexiune. Verifică dacă serverul e pornit."
        );
      }
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

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <FiX />
        </button>

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
                  type="text"
                  name="title"
                  placeholder="ex. Hackathon Suceava"
                  className={styles.input}
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
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
              </div>
            </div>

            <div className={styles.col}>
              <label className={styles.label}>Descriere & Agendă</label>
              <textarea
                name="description"
                placeholder="Despre ce este evenimentul..."
                className={styles.textarea}
                value={formData.description}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div className={styles.col}>
              <label className={styles.label}>Categorie</label>
              <div className={styles.categoriesWrapper}>
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
                  type="datetime-local"
                  name="startDate"
                  className={styles.input}
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
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
              </div>
            </div>
          </div>

          {/* --- 3. ACADEMIC --- */}
          <div className={styles.sectionBlock}>
            <div className={styles.sectionTitle}>
              <FiCheckCircle /> Afiliere
            </div>
            <div className={styles.row}>
              {/* FACULTATE */}
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

              {/* DEPARTAMENT */}
              <div className={styles.col}>
                <label className={styles.label}>Departament</label>
                <select
                  name="department"
                  className={styles.select}
                  value={formData.department}
                  onChange={handleChange}
                  // Dacă nu e selectată o facultate, dezactivăm departamentele
                  disabled={!formData.faculty}
                >
                  <option value="">Opțional...</option>

                  {/* Afișăm DOAR departamentele filtrate */}
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
};

export default CreateEventModal;
