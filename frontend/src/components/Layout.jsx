import React, { useState } from 'react';
import { jwtDecode } from "jwt-decode";
import Navbar from './Navbar';
import Sidebar from './Sidebar'; // Sidebar-ul vechi (Student)
import OrganizerSidebar from './OrganizerSidebar'; // Sidebar-ul nou
import styles from '../styles/Layout.module.css';
import { ACCESS_TOKEN } from '../constants';

const Layout = ({ children }) => {
    
    // Citim rolul userului direct in Layout
    const [userRole] = useState(() => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            try {
                const decoded = jwtDecode(token);
                return decoded.is_organizer ? "organizer" : "student";
            } catch {
                return "student";
            }
        }
        return "student";
    });

    return (
        <div className={styles.layoutContainer}>
            <Navbar />
            
            <div className={styles.mainWrapper}>
                {/* LOGICA DE SELECTIE A SIDEBARULUI */}
                {userRole === 'organizer' ? <OrganizerSidebar /> : <Sidebar />}
                
                <main className={styles.contentArea}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;