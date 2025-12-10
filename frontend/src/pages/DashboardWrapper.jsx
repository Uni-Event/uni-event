import React from "react";
import { getUserRole } from "../utils/auth";

import HomePage from "./HomePage";           
import OrganizerHomePage from "./OrganizerHomePage"; 

const DashboardWrapper = () => {
  const role = getUserRole();

  // 1. Daca e Organizator -> Arata Dashboard-ul special
  if (role && role.isOrganizer) {
    return <OrganizerHomePage />;
  }

  // 2. Altfel (Student) -> Arata Home-ul normal
  return <HomePage />;
};

export default DashboardWrapper;