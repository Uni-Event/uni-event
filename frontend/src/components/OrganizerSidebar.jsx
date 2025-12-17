import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaPlus, FaGlobe, FaTasks, FaChartPie, FaSignOutAlt } from 'react-icons/fa';
import styles from '../styles/Sidebar.module.css';

const OrganizerSidebar = ({ onOpenCreate }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/logout');
    };

    const links = [
        { 
            icon: <FaPlus />, 
            label: "Creează Eveniment", 
            isSpecial: true 
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
            <div className={styles.navGroup}>
                {links.map((link, index) => {
                    if (link.isSpecial) {
                        return (
                            <button 
                                key={index}
                                onClick={onOpenCreate}
                                className={`${styles.navItem} ${styles.addButton}`}
                                style={{
                                    border: 'none',
                                    background: 'transparent', 
                                    width: '100%',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    textAlign: 'left',
                                    fontFamily: 'inherit',
                                    fontSize: 'inherit'
                                }}
                            >
                                <div className={styles.iconWrapper}>
                                    {link.icon}
                                </div>
                                <span className={styles.label}>{link.label}</span>
                            </button>
                        );
                    }

                    return (
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
                    );
                })}
            </div>

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