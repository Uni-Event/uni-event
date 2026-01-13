import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaUser,
  FaTicketAlt,
  FaCalendarAlt,
} from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import styles from "../styles/Navbar.module.css";
import { ACCESS_TOKEN } from "../constants";
import logo from "../assets/logo-UniEvent.png";

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Închide dropdown-ul la click în exterior
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Preluăm biletele și filtrăm pentru ziua de mâine
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get("/api/interactions/tickets/");
        const tickets = res.data;

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split("T")[0];

        const filtered = tickets.filter((ticket) => {
          const eventDate = ticket.event_details?.start_date;
          return eventDate && eventDate.startsWith(tomorrowStr);
        });

        setUpcomingEvents(filtered);
        setNotificationCount(filtered.length);
      } catch (err) {
        console.error("Eroare la preluarea notificărilor:", err);
      }
    };

    if (localStorage.getItem(ACCESS_TOKEN)) {
      fetchNotifications();
    }
  }, []);

  const [user] = useState(() => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    const defaultUser = { name: "Vizitator", email: "" };

    if (token) {
      try {
        const decoded = jwtDecode(token);
        return {
          name: decoded.full_name || decoded.email || "Utilizator",
          email: decoded.email,
        };
      } catch {
        return defaultUser;
      }
    }
    return defaultUser;
  });

  const handleLogout = () => navigate("/logout");

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    user.name
  )}&background=8a56d1&color=fff&size=128&bold=true`;

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.container}>
          <div className={styles.navLogo}>
            <Link to="/" className={styles.logoLink} aria-label="UniEvent">
              <img src={logo} alt="UniEvent" className={styles.navbarLogo} />
            </Link>
          </div>

          <div className={styles.navRight}>
            <div className={styles.navLinks}>
              <Link to="/" className={styles.navLink}>
                Acasă
              </Link>

              {/* Dropdown Notificări */}
              <div className={styles.notificationWrapper} ref={dropdownRef}>
                <div
                  className={styles.navLink}
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  style={{ cursor: "pointer", position: "relative" }}
                >
                  Notificări
                  {notificationCount > 0 && (
                    <span className={styles.redDot}></span>
                  )}
                </div>

                {isNotificationsOpen && (
                  <div className={styles.notificationDropdown}>
                    <div className={styles.dropdownHeader}>
                      EVENIMENTE MÂINE
                    </div>
                    <div className={styles.dropdownContentScroll}>
                      {upcomingEvents.length > 0 ? (
                        upcomingEvents.map((ticket, index) => (
                          <div key={index} className={styles.notificationItem}>
                            <FaCalendarAlt className={styles.notifIcon} />
                            <div className={styles.notifText}>
                              <p className={styles.notifTitle}>
                                {ticket.event_details.title}
                              </p>
                              <span className={styles.notifLabel}>
                                Începe la{" "}
                                {new Date(
                                  ticket.event_details.start_date
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className={styles.emptyNotif}>
                          Nu ai bilete pentru mâine.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Profil Container */}
            <div className={styles.profileContainer}>
              <div className={styles.profileSection}>
                <div
                  className={styles.avatar}
                  style={{ backgroundImage: `url(${avatarUrl})` }}
                />
                <div className={styles.profileInfo}>
                  <span className={styles.greeting}>Salut,</span>
                  <span className={styles.username}>{user.name}</span>
                </div>
              </div>

              <div className={styles.dropdownMenu}>
                <div className={styles.emailDisplay}>{user.email}</div>
                <div className={styles.divider}></div>
                <Link to="/my-tickets" className={styles.dropdownItem}>
                  <FaTicketAlt /> Biletele Mele
                </Link>
                <Link to="/profile" className={styles.dropdownItem}>
                  <FaUser /> Profil
                </Link>
                <div className={styles.divider}></div>
                <button
                  onClick={handleLogout}
                  className={`${styles.dropdownItem} ${styles.danger}`}
                >
                  <FaSignOutAlt /> Deconectare
                </button>
              </div>
            </div>

            <button
              className={styles.menuToggle}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </nav>

      {/* Meniul Mobil */}
      <div
        className={`${styles.mobileMenu} ${
          isMobileMenuOpen ? styles.active : ""
        }`}
      >
        <div className={styles.mobileProfile}>
          <div
            className={styles.mobileAvatar}
            style={{ backgroundImage: `url(${avatarUrl})` }}
          />
          <div className={styles.mobileUserInfo}>
            <span className={styles.mobileUsername}>{user.name}</span>
          </div>
        </div>
        <Link
          to="/"
          className={styles.mobileLink}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Acasă
        </Link>
        <Link
          to="/my-tickets"
          className={styles.mobileLink}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Biletele Mele
        </Link>
        <div
          className={styles.mobileLink}
          onClick={handleLogout}
          style={{ color: "#ff4d4d" }}
        >
          <FaSignOutAlt style={{ marginRight: "10px" }} /> Deconectare
        </div>
      </div>
    </>
  );
}

export default Navbar;
