import { useState, useEffect } from "react";
import type { Route } from "../../../../types/routes";
import { updateRoute } from "../../../../services/routesApiService";

export const useRouteConfiguration = (route: Route, onUpdateRoute: (route: Route) => void) => {
    const [bufferSize, setBufferSize] = useState<number>(10);
    const [maxRouteLength, setMaxRouteLength] = useState<number>(200);
    const [poiPerDay, setPoiPerDay] = useState<number>(5);

    useEffect(() => {
        if (route) {
            setBufferSize(route.buffer_size || 10);
            setMaxRouteLength(route.max_route_length_day || 200);
            setPoiPerDay(route.poi_per_day || 5);
        }
    }, [route]);

    const handleSave = async () => {
        try {
            const updatedRoute = await updateRoute(route.id, {
                buffer_size: bufferSize,
                max_route_length_day: maxRouteLength,
                poi_per_day: poiPerDay
            });
            onUpdateRoute(updatedRoute);
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    return {
        bufferSize,
        setBufferSize,
        maxRouteLength,
        setMaxRouteLength,
        poiPerDay,
        setPoiPerDay,
        handleSave
    };
};
