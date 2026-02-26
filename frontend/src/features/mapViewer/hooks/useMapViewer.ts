import { useState, useEffect, useCallback } from "react";
import { fetchGetRoute } from "../../../services/routesApiService";
import { fetchMyUser } from "../../../services/usersApiService";
import type { Route } from '../../../types/routes';
import type { User } from '../../../types/users';
import { usePois } from "./usePois";
import { getErrorMessage } from "../../../utils/apiError";
import type { LineString } from "geojson";

export const useMapViewer = (routeId: number | null) => {
    const [route, setRoute] = useState<Route | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [routeLine, setRouteLine] = useState<LineString | undefined>(undefined);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const { pois, clusters } = usePois(route);
    const camps = route?.camps ?? [];

    useEffect(() => {
        fetchMyUser()
            .then(setCurrentUser)
            .catch(() => {});
    }, []);

    const fetchRoute = useCallback(async () => {
        if (routeId === null) {
            setError("Id trasy nebylo poskytnuto");
            return;
        }
        if (routeId === 0) {
            setError("Neplatné ID trasy");
            return;
        }

        setLoading(true);
        try {
            const routeData = await fetchGetRoute(routeId);
            setRoute(routeData);
            setRouteLine(routeData.complete_route);
        } catch (err) {
            setError(getErrorMessage(err, "Nepodařilo se načíst trasu"));
        } finally {
            setLoading(false);
        }
    }, [routeId]);

    useEffect(() => {
        fetchRoute();
    }, [fetchRoute]);

    const visibleCrewMembers = route?.users?.filter(u => u.id !== currentUser?.id) ?? [];
    const visibleOwner = route?.user?.id === currentUser?.id ? undefined : route?.user;

    return {
        route,
        loading,
        error,
        pois,
        camps,
        clusters,
        routeLine,
        currentUser,
        visibleCrewMembers,
        visibleOwner,
        setRoute,
        refetch: fetchRoute,
    };
};
