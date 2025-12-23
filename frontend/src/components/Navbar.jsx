import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaSignOutAlt, FaUser, FaTicketAlt } from 'react-icons/fa';
import { jwtDecode } from "jwt-decode";
import styles from '../styles/Navbar.module.css';
import { ACCESS_TOKEN } from '../constants';

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const [user] = useState(() => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    const defaultUser = { name: "Vizitator", email: "" };

    if (token) {
      try {
        const decoded = jwtDecode(token);
        const displayName = decoded.full_name || decoded.email || "Utilizator";
        return {
          name: displayName,
          email: decoded.email,
          role: decoded.is_organizer ? "Organizator" : "Student"
        };
      } catch {
        return defaultUser;
      }
    }
    return defaultUser;
  });

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    navigate('/logout');
  };

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=8a56d1&color=fff&size=128&bold=true`;

  const navLinks = [
    { to: "/", label: "Acasă" },
    { to: "/notifications", label: "Notificări" },
  ];

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.container}>
          
          {/* Logo */}
          <div className={styles.navLogo}>
            <Link to="/" className={styles.logoLink}>
              UniEvent
            </Link>
          </div>

          {/* Partea Dreapta - Desktop */}
          <div className={styles.navRight}>
            
            <div className={styles.navLinks}>
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} className={styles.navLink}>
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Profil Container cu Dropdown */}
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

              {/* Meniul Dropdown (Apare la Hover) */}
              <div className={styles.dropdownMenu}>
                 <div className={styles.dropdownItem} style={{pointerEvents: 'none', fontSize: '0.8rem', color: '#999'}}>
                    {user.email}
                 </div>
                 <div className={styles.divider}></div>
                 
                 <Link to="/my-tickets" className={styles.dropdownItem}>
                    <FaTicketAlt /> Biletele Mele
                 </Link>
                 
                 <Link to="/profile" className={styles.dropdownItem}>
                    <FaUser /> Profil
                 </Link>
                 
                 <div className={styles.divider}></div>
                 
                 <button onClick={handleLogout} className={`${styles.dropdownItem} ${styles.danger}`}>
                    <FaSignOutAlt /> Deconectare
                 </button>
              </div>
            </div>

            {/* Buton Hamburger (Mobil) */}
            <button 
              className={styles.menuToggle} 
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </nav>

      {/* Meniul Mobil */}
      <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.active : ''}`}>
        
        {/* Profil Mobil */}
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
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}

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
            style={{ color: '#d32f2f' }}
        >
            <FaSignOutAlt style={{ marginRight: '10px' }}/> Deconectare
        </div>
      </div>
    </>
  );
}

export default Navbar;