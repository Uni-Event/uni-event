import React from 'react';
import styles from '../styles/EventCard.module.css';
import {
  FiCalendar,
  FiMapPin,
  FiUser,
  FiHeart,
  FiMaximize,
  FiImage
} from 'react-icons/fi';

const EventCard = () => {
  return (
    <div className={styles.card}>
      
      {/* Imagine */}
      <div className={styles.imageContainer}>
        <div className={styles.placeholderGradient}>
          <FiImage size={40} color="rgba(255,255,255,0.5)" />
        </div>

        <button
          className={styles.viewCoverBtn}
          title="Vezi afișul"
        >
          <FiMaximize /> Vezi afișul
        </button>
      </div>

      {/* Conținut */}
      <div className={styles.content}>
        <h3 className={styles.title}>Titlu Eveniment</h3>

        <p className={styles.description}>
          Aceasta este o descriere de exemplu pentru un eveniment.
          Componenta este folosită doar pentru prezentare.
        </p>

        <div className={styles.metaRow}>
          <FiUser className={styles.icon} />
          <span>Organizator Eveniment</span>
        </div>

        <div className={styles.metaRow}>
          <FiCalendar className={styles.icon} />
          <span>12 dec 2025, 18:00</span>
        </div>

        <div className={styles.metaRow}>
          <FiMapPin className={styles.icon} />
          <span>Amfiteatrul A, USV</span>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <button className={styles.favBtn}>
          <FiHeart />
        </button>

        <button className={styles.detailsBtn}>
          Vezi Detalii
        </button>
      </div>

    </div>
  );
};

export default EventCard;














