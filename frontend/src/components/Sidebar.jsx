import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaHome, FaHeart, FaTicketAlt, FaSignOutAlt, FaCalendarPlus, FaChartLine } from 'react-icons/fa';
import { jwtDecode } from "jwt-decode";
import styles from '../styles/Sidebar.module.css';
import { ACCESS_TOKEN } from '../constants';

const Sidebar = () => {
    const navigate = useNavigate();

    const [userRole] = useState(() => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            try {
                const decoded = jwtDecode(token);
                return decoded.is_organizer ? "organizer" : "student";
            } catch (error) {
                return "student";
            }
        }
        return "student";
    });

    const handleLogout = () => {
        navigate('/logout');
    };

    const studentLinks = [
        { to: "/", icon: <FaHome />, label: "Acasă" },
        { to: "/favorites", icon: <FaHeart />, label: "Favorite" },
        { to: "/my-tickets", icon: <FaTicketAlt />, label: "Bilete" },
    ];

    const organizerLinks = [
        { to: "/", icon: <FaHome />, label: "Dashboard" },
        { to: "/organizer/events", icon: <FaCalendarPlus />, label: "Evenimente" },
        { to: "/organizer/stats", icon: <FaChartLine />, label: "Statistici" },
    ];

    const linksToRender = userRole === 'organizer' ? organizerLinks : studentLinks;

    return (
        <div className={styles.sidebar}>
            <div className={styles.navGroup}>
                {linksToRender.map((link) => (
                    <NavLink 
                        key={link.to} 
                        to={link.to} 
                        className={({ isActive }) => 
                            `${styles.navItem} ${isActive ? styles.active : ''}`
                        }
                    >
                        {/* AICI E SCHIMBAREA: Am pus iconWrapper pentru centrare */}
                        <div className={styles.iconWrapper}>
                            {link.icon}
                        </div>
                        <span className={styles.label}>{link.label}</span>
                    </NavLink>
                ))}
            </div>

            <div className={styles.footerGroup}>
                <button onClick={handleLogout} className={`${styles.navItem} ${styles.logoutBtn}`}>
                    <div className={styles.iconWrapper}>
                        <FaSignOutAlt />
                    </div>
                    <span className={styles.label}>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;