import { jwtDecode } from "jwt-decode";
import { ACCESS_TOKEN } from "../constants";

export const getUserRole = () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) return null;

    try {
        const decoded = jwtDecode(token);
        return {
            isOrganizer: decoded.is_organizer,
            isStaff: decoded.is_staff,         
            email: decoded.email
        };
    } catch (error) {
        console.error(error);
        return null;
    }
};