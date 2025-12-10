import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaPlus, FaGlobe, FaTasks, FaChartPie, FaSignOutAlt } from 'react-icons/fa';
import styles from '../styles/Sidebar.module.css';

const OrganizerSidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/logout');
    };

    const links = [
        { 
            to: "/organizer/create", 
            icon: <FaPlus />, 
            label: "Creează Eveniment", 
            isSpecial: true // Flag pentru butonul verde
        },
        { 
            to: "/", 
            icon: <FaGlobe />, 
            label: "Acasă (Public)" 
        },
        { 
            to: "/organizer/dashboard", 
            icon: <FaTasks />, 
            label: "Gestionează" 
        },
        { 
            to: "/organizer/stats", 
            icon: <FaChartPie />, 
            label: "Statistici" 
        },
    ];

    return (
        <div className={styles.sidebar}>
            {/* Navigarea de sus */}
            <div className={styles.navGroup}>
                {links.map((link) => (
                    <NavLink 
                        key={link.to} 
                        to={link.to} 
                        className={({ isActive }) => 
                            `${styles.navItem} ${isActive ? styles.active : ''} ${link.isSpecial ? styles.addButton : ''}`
                        }
                    >
                        <div className={styles.iconWrapper}>
                            {link.icon}
                        </div>
                        <span className={styles.label}>{link.label}</span>
                    </NavLink>
                ))}
            </div>

            {/* Butonul de Logout (Jos) */}
            <div className={styles.footerGroup}>
                <button onClick={handleLogout} className={`${styles.navItem} ${styles.logoutBtn}`}>
                    <div className={styles.iconWrapper}><FaSignOutAlt /></div>
                    <span className={styles.label}>Deconectare</span>
                </button>
            </div>
        </div>
    );
};

export default OrganizerSidebar;