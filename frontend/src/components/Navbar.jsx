import React, { useMemo, useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaUser,
  FaTicketAlt,
  FaHeart,
  FaChartBar,
  FaClipboardList,
  FaBell,
} from "react-icons/fa";
import { BsQrCodeScan } from "react-icons/bs";
import { jwtDecode } from "jwt-decode";
import styles from "../styles/Navbar.module.css";
import { ACCESS_TOKEN } from "../constants";
import logo from "../assets/logo-UniEvent.png";

import api from "../services/api";
import { useNotifications } from "../notifications/notifications.store";
import MobileNotifications from "./MobileNotifications";

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // desktop dropdown
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // mobile modal
  const [mobileNotifOpen, setMobileNotifOpen] = useState(false);
  const [mobileNotifClosing, setMobileNotifClosing] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem(ACCESS_TOKEN);
  const { unreadCount, setUnreadCount, items, setItems } = useNotifications();

  // ✅ ref unic (inainte aveai DUPLICAT)
  const scrollLockRef = useRef({
    locked: false,
    scrollY: 0,
    prevPosition: "",
    prevTop: "",
    prevLeft: "",
    prevRight: "",
    prevWidth: "",
  });

  const lockBodyScroll = () => {
    if (scrollLockRef.current.locked) return;

    scrollLockRef.current.locked = true;
    scrollLockRef.current.scrollY = window.scrollY || 0;

    scrollLockRef.current.prevPosition = document.body.style.position;
    scrollLockRef.current.prevTop = document.body.style.top;
    scrollLockRef.current.prevLeft = document.body.style.left;
    scrollLockRef.current.prevRight = document.body.style.right;
    scrollLockRef.current.prevWidth = document.body.style.width;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollLockRef.current.scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
  };

  const unlockBodyScroll = () => {
    if (!scrollLockRef.current.locked) return;

    document.body.style.position = scrollLockRef.current.prevPosition;
    document.body.style.top = scrollLockRef.current.prevTop;
    document.body.style.left = scrollLockRef.current.prevLeft;
    document.body.style.right = scrollLockRef.current.prevRight;
    document.body.style.width = scrollLockRef.current.prevWidth;

    const y = scrollLockRef.current.scrollY;

    scrollLockRef.current.locked = false;
    scrollLockRef.current.scrollY = 0;

    window.scrollTo(0, y);
  };

  // ✅ lock/unlock in functie de stari (fara setState aici)
  useEffect(() => {
    const shouldLock =
      isMobileMenuOpen || mobileNotifOpen || mobileNotifClosing;

    if (shouldLock) lockBodyScroll();
    else unlockBodyScroll();

    return () => {
      unlockBodyScroll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobileMenuOpen, mobileNotifOpen, mobileNotifClosing]);

  // ✅ la navigare: doar UNLOCK (fara setState)
  useEffect(() => {
    unlockBodyScroll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // close desktop notif dropdown on outside click
  useEffect(() => {
    const onDown = (e) => {
      if (!notifRef.current) return;
      if (!notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const user = useMemo(() => {
    const fallback = { name: "Utilizator", email: "", isOrganizer: false };
    if (!token) return fallback;

    try {
      const decoded = jwtDecode(token);
      const displayName = decoded.full_name || decoded.email || "Utilizator";
      return {
        name: displayName,
        email: decoded.email || "",
        isOrganizer: Boolean(decoded.is_organizer),
      };
    } catch {
      return fallback;
    }
  }, [token]);

  const isOrganizer = user.isOrganizer;

  const toggleMobileMenu = () => setIsMobileMenuOpen((v) => !v);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    // daca notificari mobile sunt deschise, le inchidem "hard"
    setMobileNotifClosing(false);
    setMobileNotifOpen(false);
  };

  const handleLogout = () => {
    closeMobileMenu();
    navigate("/logout");
  };

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    user.name
  )}&background=8a56d1&color=fff&size=128&bold=true`;

  const navLinks = [{ to: "/", label: "Acasă" }];

  const roleMenuItems = useMemo(() => {
    if (isOrganizer) {
      return [
        {
          to: "/organizer/dashboard",
          label: "Gestiune",
          icon: <FaClipboardList />,
        },
        { to: "/organizer/stats", label: "Statistici", icon: <FaChartBar /> },
        {
          to: "/organizer/scan",
          label: "Scanare Bilete",
          icon: <BsQrCodeScan />,
        },
      ];
    }

    return [
      { to: "/favorites", label: "Favorite", icon: <FaHeart /> },
      { to: "/my-tickets", label: "Biletele Mele", icon: <FaTicketAlt /> },
    ];
  }, [isOrganizer]);

  const notifItems = useMemo(() => {
    if (Array.isArray(items)) return items;
    if (items && Array.isArray(items.items)) return items.items;
    if (items && Array.isArray(items.results)) return items.results;
    if (items && Array.isArray(items.notifications)) return items.notifications;
    return [];
  }, [items]);

  if (!token) return null;

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  const markOneRead = async (id) => {
    try {
      await api.patch(
        `${API_BASE_URL}/api/interactions/notifications/${id}/read/`
      );
    } catch (e) {
      console.error(e);
    }

    setItems((prev) =>
      (prev || []).map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    try {
      await api.patch(
        `${API_BASE_URL}/api/interactions/notifications/read-all/`
      );
    } catch (e) {
      console.error(e);
    }

    setItems((prev) => (prev || []).map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get(
        `${API_BASE_URL}/api/interactions/notifications/`
      );

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.results)
        ? data.results
        : [];

      setItems(list);
      setUnreadCount(list.filter((n) => !n.is_read).length);
      return list;
    } catch (e) {
      console.error("Fetch notifications failed:", e);
      return [];
    }
  };

  const openMobileNotifications = async () => {
    // ✅ inchide meniul mobil inainte (altfel ramai in lock)
    setIsMobileMenuOpen(false);

    setMobileNotifClosing(false);
    await fetchNotifications();
    setMobileNotifOpen(true);
  };

  // close cu animatie
  const closeMobileNotifications = () => {
    if (!mobileNotifOpen) return;
    setMobileNotifClosing(true);

    window.setTimeout(() => {
      setMobileNotifClosing(false);
      setMobileNotifOpen(false);
    }, 200);
  };

  return (
    <>
      {/* NAVBAR (Desktop) */}
      <nav className={styles.navbar}>
        <div className={styles.container}>
          {/* Logo */}
          <div className={styles.navLogo}>
            <Link to="/" className={styles.logoLink} aria-label="UniEvent">
              <img src={logo} alt="UniEvent" className={styles.navbarLogo} />
            </Link>
          </div>

          {/* Right side */}
          <div className={styles.navRight}>
            {/* Links + Notificari (desktop) */}
            <div className={styles.navLinks}>
              {navLinks.map((link) => (
                <Link
                  key={`${link.to}-${link.label}`}
                  to={link.to}
                  className={styles.navLink}
                >
                  {link.label}
                </Link>
              ))}

              <div className={styles.notifWrap} ref={notifRef}>
                <button
                  type="button"
                  className={styles.navLink}
                  onClick={async () => {
                    const next = !notifOpen;
                    setNotifOpen(next);
                    if (next) await fetchNotifications();
                  }}
                >
                  Notificări
                  {unreadCount > 0 && <span className={styles.notifDot} />}
                </button>

                {notifOpen && (
                  <div className={styles.notifDropdown} role="menu">
                    <div className={styles.notifHeader}>
                      <span>Notificări</span>
                      <button
                        type="button"
                        className={styles.notifAction}
                        onClick={markAllRead}
                        disabled={unreadCount === 0}
                      >
                        Marchează toate
                      </button>
                    </div>

                    <div className={styles.notifList}>
                      {notifItems.length === 0 ? (
                        <div className={styles.notifEmpty}>
                          Nu ai notificări.
                        </div>
                      ) : (
                        notifItems.slice(0, 8).map((n) => (
                          <button
                            key={n.id}
                            type="button"
                            className={`${styles.notifItem} ${
                              !n.is_read ? styles.unread : ""
                            }`}
                            onClick={() => {
                              if (!n.is_read) markOneRead(n.id);
                              setNotifOpen(false);
                            }}
                          >
                            <div className={styles.notifTitle}>{n.title}</div>
                            <div className={styles.notifMsg}>{n.message}</div>
                            <div className={styles.notifTime}>
                              {n.created_at
                                ? new Date(n.created_at).toLocaleString()
                                : ""}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Profil + Dropdown (desktop) */}
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

                {roleMenuItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={styles.dropdownItem}
                  >
                    {item.icon} {item.label}
                  </Link>
                ))}

                <div className={styles.divider} />

                <Link to="/profile" className={styles.dropdownItem}>
                  <FaUser /> Profil
                </Link>

                <div className={styles.divider} />

                <button
                  onClick={handleLogout}
                  className={`${styles.dropdownItem} ${styles.danger}`}
                  type="button"
                >
                  <FaSignOutAlt /> Deconectare
                </button>
              </div>
            </div>

            {/* Hamburger (mobil) */}
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
            <span className={styles.mobileGreeting}>Salut,</span>
            <span className={styles.mobileUsername}>{user.name}</span>
          </div>
        </div>

        {navLinks.map((link) => (
          <Link
            key={`${link.to}-${link.label}-m`}
            to={link.to}
            className={styles.mobileLink}
            onClick={closeMobileMenu}
          >
            {link.label}
          </Link>
        ))}

        {/* Notificări (mobil) - sub Acasă, fără icon, stil ca Acasă */}
        {!isOrganizer && (
          <button
            type="button"
            className={styles.mobileLink}
            onClick={openMobileNotifications}
          >
            <span>Notificări</span>
            {unreadCount > 0 && (
              <span className={styles.mobileNotifBadge}>{unreadCount}</span>
            )}
          </button>
        )}

        {roleMenuItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={styles.mobileLink}
            onClick={closeMobileMenu}
          >
            <span className={styles.mobileIcon}>{item.icon}</span>
            {item.label}
          </Link>
        ))}

        <Link
          to="/profile"
          className={styles.mobileLink}
          onClick={closeMobileMenu}
        >
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

      {/* Mobile notifications modal (componenta) + close animat */}
      <MobileNotifications
        open={mobileNotifOpen}
        closing={mobileNotifClosing}
        onClose={closeMobileNotifications}
        items={notifItems}
        unreadCount={unreadCount}
        onMarkOneRead={(id) => {
          if (!id) return;
          markOneRead(id);
          closeMobileNotifications();
          setIsMobileMenuOpen(false);
        }}
        onMarkAllRead={() => {
          markAllRead();
        }}
      />
    </>
  );
}

export default Navbar;