import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/EventCard.module.css';
import { FiCalendar, FiMapPin, FiUser, FiHeart, FiMaximize, FiX, FiImage } from 'react-icons/fi';

const EventCard = ({ event, showFavorite = true }) => {
  const navigate = useNavigate();
  const [isImageOpen, setIsImageOpen] = useState(false);

  // 1. Dacă event e null, nu randăm nimic
  if (!event) return null;

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  // 2. Helper pentru Imagine
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;

    let cleanPath = imagePath; 
    if (!cleanPath.startsWith('/')) {
        cleanPath = `/${cleanPath}`;
    }
    if (!cleanPath.startsWith('/media')) {
        return `${API_BASE_URL}/media${cleanPath}`;
    }

    return `${API_BASE_URL}${cleanPath}`;
  };

  // 3. Helper pentru Dată
  const formatDate = (dateString) => {
    if (!dateString) return "Dată neanunțată";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ro-RO', { 
        day: 'numeric', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return "Dată invalidă";
    }
  };

  // 4. Helper pentru Locație
  const getLocationName = () => {
    // Verificăm dacă location e obiect sau string
    if (event.location && typeof event.location === 'object') {
      return event.location.name || "Locație necunoscută";
    }
    // Dacă e string => nume
    if (typeof event.location === 'string') return event.location;
    
    return "Locație necunoscută";
  };

  // 5. Helper pentru organizator
  const getOrganizerName = () => {
    const org = event.organizer;

    if (!org) return "Admin";

    if (typeof org === 'object') {
        if (org.first_name || org.last_name) {
            return `${org.first_name || ''} ${org.last_name || ''}`.trim();
        }
        
        if (org.email) return org.email;
        
        if (org.username) return org.username;
        
        return "Organizator";
    }

    return String(org);
  };

  // Funcție pentru deschiderea imaginii
  const handleOpenImage = (e) => {
    e.stopPropagation(); 
    setIsImageOpen(true);
  };

  // Funcție pentru închiderea imaginii
  const handleCloseImage = (e) => {
    e.stopPropagation();
    setIsImageOpen(false);
  };

  const finalImageUrl = getImageUrl(event.image);

  return (
    <>
      <div className={styles.card} onClick={() => navigate(`/events/${event.id}`)}>
        <div className={styles.imageContainer}>
          {event.image ? (
            <>
              <img 
                src={finalImageUrl} 
                alt={event.title || "Eveniment"} 
                className={styles.eventImage} 
                onError={(e) => { e.target.style.display = 'none'; }} 
              />
              
              <button 
                className={styles.viewCoverBtn} 
                onClick={handleOpenImage}
                title="Vezi afișul complet"
              >
                <FiMaximize />Vezi afișul
              </button>
            </>
          ) : (
            <div className={styles.placeholderGradient}>
              <FiImage size={40} color="rgba(255,255,255,0.5)" />
            </div>
          )}
        </div>

        <div className={styles.content}>
            <h3 className={styles.title} title={event.title}>{event.title || "Titlu indisponibil"}</h3>
            <p className={styles.description}>{event.description || "Fără descriere disponibilă."}</p>
            <div className={styles.metaRow}>
                <FiUser className={styles.icon} /> <span>{getOrganizerName()}</span>
            </div>
            <div className={styles.metaRow}>
                <FiCalendar className={styles.icon} /> <span>{formatDate(event.start_date)}</span>
            </div>
            <div className={styles.metaRow}>
                <FiMapPin className={styles.icon} />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                    {getLocationName()}
                </span>
            </div>
        </div>

        <div className={styles.footer}>
          {showFavorite && (
            <button className={styles.favBtn} onClick={(e) => { e.stopPropagation(); alert('Fav!'); }}>
                <FiHeart />
            </button>
          )}
            <button className={styles.detailsBtn}>Vezi Detalii</button>
        </div>
      </div>

      {isImageOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseImage}>
          <button className={styles.closeBtn} onClick={handleCloseImage}>
            <FiX />
          </button>
          
          <img 
            src={finalImageUrl} 
            alt="Full screen" 
            className={styles.modalImage}
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </>
  );
};

export default EventCard;