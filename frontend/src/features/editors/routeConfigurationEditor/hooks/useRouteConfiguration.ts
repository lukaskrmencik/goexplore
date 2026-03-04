import { useState, useEffect, useRef, useCallback } from "react";
import type { Route } from "../../../../types/routes";
import { updateRoute } from "../../../../services/routesApiService";
import { computeDailyLimitFromRoute } from "../../../../utils/routeLengthEstimator";

const DEFAULT_BUFFER_KM = Number(import.meta.env.VITE_CONFIG_DEFAULT_BUFFER_KM ?? "20");
const DEFAULT_ROUTE_LENGTH_KM = Number(import.meta.env.VITE_CONFIG_ROUTE_LENGTH_DEFAULT_KM ?? "200");
const DEFAULT_POI_PER_DAY = Number(import.meta.env.VITE_CONFIG_POI_PER_DAY_DEFAULT ?? "5");

export const useRouteConfiguration = (
    route: Route,
    onUpdateRoute: (route: Route) => void,
    estimatedRoadKm = 0,
) => {
    const [bufferSize, setBufferSize] = useState<number>(DEFAULT_BUFFER_KM);
    const [maxRouteLength, setMaxRouteLength] = useState<number>(DEFAULT_ROUTE_LENGTH_KM);
    const [poiPerDay, setPoiPerDay] = useState<number>(DEFAULT_POI_PER_DAY);
    const hasUserChanges = useRef(false);

    const computedDailyLimit = computeDailyLimitFromRoute(route, estimatedRoadKm);

    useEffect(() => {
        if (route) {
            setBufferSize(route.buffer_size || DEFAULT_BUFFER_KM);
            setPoiPerDay(route.poi_per_day || DEFAULT_POI_PER_DAY);

            if (route.mode === 'simple') {
                setMaxRouteLength(
                    route.max_route_length_day ?? (computedDailyLimit ?? DEFAULT_ROUTE_LENGTH_KM)
                );
            } else {
                setMaxRouteLength(
                    computedDailyLimit !== null && !route.max_route_length_day
                        ? computedDailyLimit
                        : (route.max_route_length_day || DEFAULT_ROUTE_LENGTH_KM)
                );
            }
        }
    }, [route, computedDailyLimit]);

    const handleBufferSizeChange = useCallback((val: number) => {
        hasUserChanges.current = true;
        setBufferSize(val);
    }, []);

    const handleMaxRouteLengthChange = useCallback((val: number) => {
        hasUserChanges.current = true;
        setMaxRouteLength(val);
    }, []);

    const handlePoiPerDayChange = useCallback((val: number) => {
        hasUserChanges.current = true;
        setPoiPerDay(val);
    }, []);

    const handleSave = async () => {
        if (!hasUserChanges.current) return;

        const dailyLimit = maxRouteLength;

        const updatedRoute = await updateRoute(route.id, {
            buffer_size: bufferSize,
            max_route_length_day: dailyLimit,
            poi_per_day: poiPerDay,
        });
        onUpdateRoute(updatedRoute);
    };

    return {
        bufferSize,
        maxRouteLength,
        setMaxRouteLength,
        poiPerDay,
        computedDailyLimit,
        handleBufferSizeChange,
        handleMaxRouteLengthChange,
        handlePoiPerDayChange,
        handleSave,
    };
};
