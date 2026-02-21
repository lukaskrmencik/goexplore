import { useState, useEffect } from "react";
import { fetchAllRoutes, fetchSharedRoutes } from "../../../../services/routesApiService";
import type { RouteItem } from "../../../../types/routes";
import { getErrorMessage } from "../../../../utils/apiError";

export const useRoutesList = (page = 1) => {
    const [ownedRoutes, setOwnedRoutes] = useState<RouteItem[]>([]);
    const [sharedRoutes, setSharedRoutes] = useState<RouteItem[]>([]);

    // Pagination Metadata State
    const [ownedPagination, setOwnedPagination] = useState({ page: 1, total_pages: 1, total_items: 0 });
    const [sharedPagination, setSharedPagination] = useState({ page: 1, total_pages: 1, total_items: 0 });

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Paralelní načtení s paginací
            const [ownedRes, sharedRes] = await Promise.all([
                fetchAllRoutes(page),
                fetchSharedRoutes(page)
            ]);

            setOwnedRoutes(ownedRes.items);
            setOwnedPagination({
                page: ownedRes.page,
                total_pages: ownedRes.total_pages,
                total_items: ownedRes.total_items
            });

            setSharedRoutes(sharedRes.items);
            setSharedPagination({
                page: sharedRes.page,
                total_pages: sharedRes.total_pages,
                total_items: sharedRes.total_items
            });

        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err, "Nepodařilo se načíst seznam tras."));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [page]); // Re-run when page changes

    // Funkce pro nastavení "Aktivní trasy" po kliknutí
    const openRoute = (routeId: number) => {
        localStorage.setItem("lastActiveRouteId", routeId.toString());
        // Zde by byl navigate, ale to uděláme v komponentě
    };

    return {
        ownedRoutes,
        sharedRoutes,
        ownedPagination,
        sharedPagination,
        isLoading,
        error,
        openRoute,
        refetch: loadData
    };
};
