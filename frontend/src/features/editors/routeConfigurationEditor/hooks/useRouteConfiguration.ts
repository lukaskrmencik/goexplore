import { useState, useEffect } from "react";
import type { Route } from "../../../../types/routes";
import { updateRoute } from "../../../../services/routesApiService";

const DEFAULT_BUFFER_KM = Number(import.meta.env.VITE_CONFIG_DEFAULT_BUFFER_KM ?? "10");
const DEFAULT_ROUTE_LENGTH_KM = Number(import.meta.env.VITE_CONFIG_ROUTE_LENGTH_DEFAULT_KM ?? "200");
const DEFAULT_POI_PER_DAY = Number(import.meta.env.VITE_CONFIG_POI_PER_DAY_DEFAULT ?? "5");

export const useRouteConfiguration = (route: Route, onUpdateRoute: (route: Route) => void) => {
    const [bufferSize, setBufferSize] = useState<number>(DEFAULT_BUFFER_KM);
    const [maxRouteLength, setMaxRouteLength] = useState<number>(DEFAULT_ROUTE_LENGTH_KM);
    const [poiPerDay, setPoiPerDay] = useState<number>(DEFAULT_POI_PER_DAY);

    useEffect(() => {
        if (route) {
            setBufferSize(route.buffer_size || DEFAULT_BUFFER_KM);
            setMaxRouteLength(route.max_route_length_day || DEFAULT_ROUTE_LENGTH_KM);
            setPoiPerDay(route.poi_per_day || DEFAULT_POI_PER_DAY);
        }
    }, [route]);

    const handleSave = async () => {
        const updatedRoute = await updateRoute(route.id, {
            buffer_size: bufferSize,
            max_route_length_day: maxRouteLength,
            poi_per_day: poiPerDay,
        });
        onUpdateRoute(updatedRoute);
    };

    return {
        bufferSize,
        setBufferSize,
        maxRouteLength,
        setMaxRouteLength,
        poiPerDay,
        setPoiPerDay,
        handleSave,
    };
};
