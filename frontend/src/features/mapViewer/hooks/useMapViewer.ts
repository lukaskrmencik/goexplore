import { useState, useEffect, useCallback } from "react";
import { fetchGetRoute } from "../../../services/routesApiService";
import type { Route } from '../../../types/routes';
import { usePois } from "./usePois";
import { getErrorMessage } from "../../../utils/apiError";
import type { LineString } from "geojson";

export const useMapViewer = (routeId: number | null) => {
	const [route, setRoute] = useState<Route | undefined>(undefined);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [routeLine, setrouteLine] = useState<LineString | undefined>(undefined);

	const { pois, clusters } = usePois(route);


	const camps = route?.camps ?? [];

	const fetchMarkers = useCallback(async () => {
		if (routeId !== null) {
			if (routeId === 0) {
				setError("Neplatné ID trasy");
				return;
			}

			setLoading(true);
			try {
				const routeData = await fetchGetRoute(routeId);
				setRoute(routeData);
				setrouteLine(routeData.complete_route)
			} catch (err) {
				console.error(err);
				setError(getErrorMessage(err, "Nepodařilo se načíst trasu"));
			} finally {
				setLoading(false);
			}
		} else {
			setError("Id trasy nebylo poskytnuto");
		}
	}, [routeId]);

	useEffect(() => {
		fetchMarkers();
	}, [fetchMarkers]);


	return { route, loading, error, pois, camps, clusters, routeLine, setRoute, refetch: fetchMarkers };
}