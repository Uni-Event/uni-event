/**
 * ProtectedRoute:
 * Componentă care protejează rutele pe baza autentificării și rolului utilizatorului.
 *
 * - Verifică dacă token-ul JWT este valid și neexpirat.
 * - Face refresh automat dacă acces token-ul a expirat.
 * - Decodează token-ul pentru a verifica rolul necesar (ex: admin, organizer).
 * - Dacă utilizatorul nu este autorizat, redirecționează la pagina de login.
 *
 * Utilizare:
 * <ProtectedRoute requiredRole="admin">
 *     <DashboardAdmin />
 * </ProtectedRoute>
 */

import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../services/api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import { useState, useEffect } from "react";

function ProtectedRoute({ children, requiredRole }) {
    const [isAuthorized, setIsAuthorized] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        auth().catch(() => setIsAuthorized(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const refreshToken = async () => {
        // Evită mai multe încercări simultane de refresh
        if (isRefreshing) return;
        
        setIsRefreshing(true);
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        
        if (!refreshToken) {
            setIsAuthorized(false);
            setIsRefreshing(false);
            return;
        }

        try {
            const res = await api.post("/api/token/refresh/", {
                refresh: refreshToken,
            });
            
            if (res.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                await checkRole(res.data.access);
            } else {
                setIsAuthorized(false);
            }
        } catch (error) {
            console.error("Refresh token failed:", error);
            localStorage.removeItem(ACCESS_TOKEN);
            localStorage.removeItem(REFRESH_TOKEN);
            setIsAuthorized(false);
        } finally {
            setIsRefreshing(false);
        }
    };

    // Funcția pentru verificarea rolului utilizatorului
    const checkRole = async (token) => {
        try {
            const decoded = jwtDecode(token);
            
            // Verifică expirarea token-ului
            const tokenExpiration = decoded.exp;
            const now = Date.now() / 1000;
            
            if (tokenExpiration < now) {
                await refreshToken();
                return;
            }

            // Verifică rolurile
            if (requiredRole === "organizer" && !decoded.is_organizer) {
                setIsAuthorized(false);
                return;
            }

            if (requiredRole === "admin" && !decoded.is_staff) {
                setIsAuthorized(false);
                return;
            }

            setIsAuthorized(true);
        } catch (error) {
            console.error("Token decode error:", error);
            setIsAuthorized(false);
        }
    };

    // Funcția principală de autentificare și autorizare
    const auth = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
            setIsAuthorized(false);
            return;
        }
        await checkRole(token);
    };

    if (isAuthorized === null || isRefreshing) {
        return <div>Se încarcă...</div>;
    }

    return isAuthorized ? children : <Navigate to="/auth" />;
}

export default ProtectedRoute;