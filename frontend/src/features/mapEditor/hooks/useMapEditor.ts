import { useState, useEffect } from "react";
import { fetchGetRoute } from "../../../services/routesApiService";
import type { Route } from '../../../types/routes';
import { usePois } from "./usePois";
import type { LineString } from "geojson";

export const useMapEditor = (routeId: number | null) => {
	const [route, setRoute] = useState<Route | undefined>(undefined);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [routeLine, setrouteLine] = useState<LineString | undefined>(undefined);

	const { pois, clusters } = usePois(route);


	const camps = route?.camps ?? [];
	

	useEffect(() => {
		const fetchMarkers = async () => {
			if(routeId !== null){
				setLoading(true);
				try {
					const routeData = await fetchGetRoute(routeId);
					setRoute(routeData);
					setrouteLine(routeData.complete_route)
				} catch (err) {
					console.error(err);
					setError("Nepodařilo se načíst trasu");
				} finally {
					setLoading(false);
				}
			}else{
				setError("Id trasy nebylo poskytnuto");
			}
		};

		fetchMarkers();
		
	}, []);


	return { route, loading, error, pois, camps, clusters, routeLine };
}