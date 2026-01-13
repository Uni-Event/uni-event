import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaUser,
  FaTicketAlt,
  FaHeart,
  FaChartBar,
  FaClipboardList,
} from "react-icons/fa";
import { BsQrCodeScan } from "react-icons/bs";
import { jwtDecode } from "jwt-decode";
import styles from "../styles/Navbar.module.css";
import { ACCESS_TOKEN } from "../constants";

function Navbar() {
  // State & Navigation
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Auth: token din storage
  const token = localStorage.getItem(ACCESS_TOKEN);

  // Decode user din token 
  const user = useMemo(() => {
    const decoded = jwtDecode(token);
    const displayName = decoded.full_name || decoded.email || "Utilizator";

    return {
      name: displayName,
      email: decoded.email || "",
      isOrganizer: Boolean(decoded.is_organizer),
    };
  }, [token]);

  // Role flags
  const isOrganizer = user.isOrganizer;

  // UI Helpers
  const toggleMobileMenu = () => setIsMobileMenuOpen((v) => !v);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = () => {
    closeMobileMenu();
    navigate("/logout");
  };

  // Avatar generat din nume (ui-avatars)
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    user.name
  )}&background=8a56d1&color=fff&size=128&bold=true`;

  // Link-uri comune (pentru ambele roluri)
  const navLinks = [
    { to: "/", label: "Acasă" },
    { to: "/", label: "Notificări" },
  ];

  // Link-uri specifice rolului
  const roleMenuItems = useMemo(() => {
    if (isOrganizer) {
      return [
        { to: "/organizer/dashboard", label: "Gestiune", icon: <FaClipboardList /> },
        { to: "/organizer/stats", label: "Statistici", icon: <FaChartBar /> },
        { to: "/organizer/scan", label: "Scanare Bilete", icon: <BsQrCodeScan /> },
      ];
    }

    // student (default)
    return [
      { to: "/favorites", label: "Favorite", icon: <FaHeart /> },
      { to: "/my-tickets", label: "Biletele Mele", icon: <FaTicketAlt /> },
    ];
  }, [isOrganizer]);

  if (!token) return null;

  return (
    <>
      {/* NAVBAR (Desktop) */}
      <nav className={styles.navbar}>
        <div className={styles.container}>
          {/* Logo */}
          <div className={styles.navLogo}>
            <Link to="/" className={styles.logoLink}>
              UniEvent
            </Link>
          </div>

          {/* Right side */}
          <div className={styles.navRight}>
            {/* Link-uri comune */}
            <div className={styles.navLinks}>
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} className={styles.navLink}>
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Profil + Dropdown */}
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
                {/* Email */}
                <div
                  className={styles.dropdownItem}
                  style={{
                    pointerEvents: "none",
                    fontSize: "0.8rem",
                    color: "#999",
                  }}
                >
                  {user.email}
                </div>

                <div className={styles.divider} />

                {/* Role items */}
                {roleMenuItems.map((item) => (
                  <Link key={item.to} to={item.to} className={styles.dropdownItem}>
                    {item.icon} {item.label}
                  </Link>
                ))}

                <div className={styles.divider} />

                {/* Profil */}
                <Link to="/profile" className={styles.dropdownItem}>
                  <FaUser /> Profil
                </Link>

                <div className={styles.divider} />

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className={`${styles.dropdownItem} ${styles.danger}`}
                  type="button"
                >
                  <FaSignOutAlt /> Deconectare
                </button>
              </div>
            </div>

            {/* Hamburger (Mobil) */}
            <button
              className={styles.menuToggle}
              onClick={toggleMobileMenu}
              type="button"
              aria-label="Deschide meniul"
            >
              {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </nav>

      {/* MENIU MOBIL */}
      <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.active : ""}`}>
        <div className={styles.mobileProfile}>
          <div
            className={styles.mobileAvatar}
            style={{ backgroundImage: `url(${avatarUrl})` }}
          />
          <div className={styles.mobileUserInfo}>
            <span className={styles.mobileGreeting}>Salut,</span>
            <span className={styles.mobileUsername}>{user.name}</span>
          </div>
        </div>

        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={styles.mobileLink}
            onClick={closeMobileMenu}
          >
            {link.label}
          </Link>
        ))}

        {roleMenuItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={styles.mobileLink}
            onClick={closeMobileMenu}
          >
            <span style={{ marginRight: "10px" }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}

        <Link to="/profile" className={styles.mobileLink} onClick={closeMobileMenu}>
          <FaUser style={{ marginRight: "10px" }} />
          Profil
        </Link>

        <div
          className={styles.mobileLink}
          onClick={handleLogout}
          style={{ color: "#d32f2f" }}
        >
          <FaSignOutAlt style={{ marginRight: "10px" }} />
          Deconectare
        </div>
      </div>
    </>
  );
}

export default Navbar;