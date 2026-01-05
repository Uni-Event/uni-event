import React, { useState } from "react";
import { jwtDecode } from "jwt-decode";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import OrganizerSidebar from "./OrganizerSidebar";
import CreateEventModal from "./organizer/CreateEventModal";
import styles from "../styles/Layout.module.css";
import { ACCESS_TOKEN } from "../constants";

const Layout = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        {userRole === "organizer" ? (
          <OrganizerSidebar onOpenCreate={() => setIsModalOpen(true)} />
        ) : (
          <Sidebar />
        )}

        <main className={styles.contentArea}>{children}</main>
        {/* 4. RANDĂM MODALUL GLOBAL */}
        {userRole === "organizer" && (
          <CreateEventModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Layout;
