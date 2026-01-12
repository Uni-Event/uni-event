import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaHome, FaHeart, FaTicketAlt, FaSignOutAlt } from 'react-icons/fa';
import styles from '../styles/Sidebar.module.css';

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/logout');
    };

    const links = [
        { 
            to: "/", 
            icon: <FaHome />, 
            label: "Acasă" 
        },
        { 
            to: "/favorites", 
            icon: <FaHeart />, 
            label: "Favorite" 
        },
        { 
            to: "/my-tickets", 
            icon: <FaTicketAlt />, 
            label: "Bilete" 
        },
    ];

    return (
        <div className={styles.sidebar}>
            <div className={styles.navGroup}>
                {links.map((link) => (
                    <NavLink 
                        key={link.to} 
                        to={link.to} 
                        className={({ isActive }) => 
                            `${styles.navItem} ${isActive ? styles.active : ''}`
                        }
                    >
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
                    <span className={styles.label}>Deconectare</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;