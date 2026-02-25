import { useState, useEffect } from "react";
import { fetchAllRoutes, fetchSharedRoutes } from "../../../../services/routesApiService";
import type { RouteItem } from "../../../../types/routes";
import { getErrorMessage } from "../../../../utils/apiError";
import type { PaginationMeta } from "../../../../types/general";

export const useRoutesList = (page = 1, searchQuery = "") => {
    const [ownedRoutes, setOwnedRoutes] = useState<RouteItem[]>([]);
    const [sharedRoutes, setSharedRoutes] = useState<RouteItem[]>([]);
    const [ownedPagination, setOwnedPagination] = useState<PaginationMeta>({ page: 1, total_pages: 1, total_items: 0 });
    const [sharedPagination, setSharedPagination] = useState<PaginationMeta>({ page: 1, total_pages: 1, total_items: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRoutes = async () => {
        setIsLoading(true);
        try {
            const [ownedResponse, sharedResponse] = await Promise.all([
                fetchAllRoutes(page, searchQuery),
                fetchSharedRoutes(page, searchQuery),
            ]);
            setOwnedRoutes(ownedResponse.items);
            setOwnedPagination({
                page: ownedResponse.page,
                total_pages: ownedResponse.total_pages,
                total_items: ownedResponse.total_items,
            });
            setSharedRoutes(sharedResponse.items);
            setSharedPagination({
                page: sharedResponse.page,
                total_pages: sharedResponse.total_pages,
                total_items: sharedResponse.total_items,
            });
        } catch (err) {
            setError(getErrorMessage(err, "Nepodařilo se načíst seznam tras."));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRoutes();
    }, [page, searchQuery]);

    return {
        ownedRoutes,
        sharedRoutes,
        ownedPagination,
        sharedPagination,
        isLoading,
        error,
        refetch: fetchRoutes,
    };
};
