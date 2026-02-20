import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const useNavigationLogic = () => {
    const [activeRouteId, setActiveRouteId] = useState<string | null>(null);
    const location = useLocation();
    const navigate = useNavigate();

    // Načteme poslední aktivní trasu z localStorage při startu
    useEffect(() => {
        const lastId = localStorage.getItem("lastActiveRouteId");
        if (lastId) {
            setActiveRouteId(lastId);
        }
    }, []);

    // Aktualizace activeRouteId podle URL, pokud jsme v /routes/:id
    useEffect(() => {
        const match = location.pathname.match(/\/routes\/(\d+)/);
        if (match && match[1]) {
            setActiveRouteId(match[1]);
            localStorage.setItem("lastActiveRouteId", match[1]);
        }
    }, [location.pathname]);

    // Helper funkce pro navigaci
    const navigateTo = (path: string) => {
        navigate(path);
    };

    // Zjistí, která záložka je aktivní podle URL
    const isActivePath = (path: string) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return {
        activeRouteId,
        navigateTo,
        isActivePath
    };
};
