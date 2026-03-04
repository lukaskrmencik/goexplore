import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { v4 as uuidv4 } from 'uuid';
import { LatLng } from "leaflet";
import type { Route } from "../../../../types/routes";
import type { EditorPoint } from "../../../../types/editor";
import {
    updateRoute,
    createWaypoint,
    deleteWaypoint,
    fetchGetRoute
} from "../../../../services/routesApiService";
import {
    latLngToGeoJsonPoint,
    geojsonPointToLatLng,
    leafletLatLngToGeoJsonLineString
} from "../../../../utils/geo";
import { computeEstimatedLength } from "../../../../utils/routeLengthEstimator";
import { isInsideCzechRepublic } from "../../../../utils/czechBoundary";

function reassignPointTypes(pts: EditorPoint[]): EditorPoint[] {
    return pts.map((p, i) => {
        let type: 'start' | 'end' | 'waypoint' = 'waypoint';
        let order = i;
        if (i === 0) {
            type = 'start';
            order = 0;
        } else if (i === pts.length - 1 && pts.length >= 2) {
            type = 'end';
            order = 9999;
        }
        if (p.type !== type || p.order !== order) {
            return { ...p, type, order };
        }
        return p;
    });
}

export const useRouteAxis = (route: Route | null, onUpdateRoute: (route: Route) => void) => {
    const [points, setPoints] = useState<EditorPoint[]>([]);
    const hasUserChanges = useRef(false);

    const estimatedRoadKm = useMemo(() => computeEstimatedLength(points).roadKm, [points]);

    useEffect(() => {
        if (!route) return;

        const cacheKey = `route_names_${route.id}`;
        let nameCache: Record<string, string> = {};
        try {
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                nameCache = JSON.parse(cached);
            }
        } catch {
        }

        const getName = (lat: number, lng: number, defaultName: string) => {
            const key = `${lat.toFixed(6)},${lng.toFixed(6)}`;
            return nameCache[key] || defaultName;
        };

        const initialPoints: EditorPoint[] = [];

        if (route.start) {
            const coords = geojsonPointToLatLng(route.start) as [number, number];
            initialPoints.push({
                id: 'start',
                lat: coords[0],
                lng: coords[1],
                type: 'start',
                name: getName(coords[0], coords[1], 'Start'),
                order: 0
            });
        }

        if (route.waypoints && route.waypoints.length > 0) {
            const sortedWaypoints = [...route.waypoints].sort((a, b) => a.order - b.order);
            sortedWaypoints.forEach(wp => {
                const coords = geojsonPointToLatLng(wp.coordinates) as [number, number];
                initialPoints.push({
                    id: `wp-${wp.id}`,
                    dbId: wp.id,
                    lat: coords[0],
                    lng: coords[1],
                    type: 'waypoint',
                    name: getName(coords[0], coords[1], `Waypoint ${wp.order}`),
                    order: wp.order
                });
            });
        }

        if (route.end) {
            const coords = geojsonPointToLatLng(route.end) as [number, number];
            initialPoints.push({
                id: 'end',
                lat: coords[0],
                lng: coords[1],
                type: 'end',
                name: getName(coords[0], coords[1], 'Cíl'),
                order: 9999
            });
        }

        setPoints(initialPoints);
    }, [route]);

    useEffect(() => {
        if (!route) return;
        const cacheKey = `route_names_${route.id}`;
        const cache: Record<string, string> = {};
        points.forEach(p => {
            if (p.name) {
                const key = `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`;
                cache[key] = p.name;
            }
        });
        localStorage.setItem(cacheKey, JSON.stringify(cache));
    }, [points, route]);

    const setStartPoint = (lat: number, lng: number, name: string) => {
        hasUserChanges.current = true;
        setPoints(prev => {
            const filtered = prev.filter(p => p.type !== 'start');
            return [{ id: 'start', lat, lng, type: 'start', name, order: 0 }, ...filtered];
        });
    };

    const setEndPoint = (lat: number, lng: number, name: string) => {
        hasUserChanges.current = true;
        setPoints(prev => {
            const filtered = prev.filter(p => p.type !== 'end');
            return [...filtered, { id: 'end', lat, lng, type: 'end', name, order: 9999 }];
        });
    };

    const insertSimpleWaypoint = (lat: number, lng: number, name: string, insertIndex: number) => {
        hasUserChanges.current = true;
        setPoints(prev => {
            const newWaypoint: EditorPoint = { id: uuidv4(), lat, lng, type: 'waypoint', name, order: 0 };
            const newPoints = [...prev];
            newPoints.splice(insertIndex, 0, newWaypoint);
            let currentOrder = 1;
            newPoints.forEach(p => {
                if (p.type === 'waypoint') {
                    p.order = currentOrder++;
                }
            });
            return newPoints;
        });
    };

    const movePoint = (dragIndex: number, hoverIndex: number) => {
        hasUserChanges.current = true;
        setPoints(prev => {
            if (dragIndex < 0 || dragIndex >= prev.length || hoverIndex < 0 || hoverIndex >= prev.length) return prev;
            if (prev[dragIndex].type !== 'waypoint') return prev;

            const newPoints = [...prev];
            const [draggedItem] = newPoints.splice(dragIndex, 1);
            newPoints.splice(hoverIndex, 0, draggedItem);

            let currentOrder = 1;
            const reorderedPoints = newPoints.map(p => {
                if (p.type === 'start') return { ...p, order: 0 };
                if (p.type === 'end') return { ...p, order: 9999 };
                return { ...p, order: currentOrder++ };
            });

            const startPoint = reorderedPoints.find(p => p.type === 'start');
            const endPoint = reorderedPoints.find(p => p.type === 'end');
            const waypoints = reorderedPoints.filter(p => p.type === 'waypoint');

            const sorted: EditorPoint[] = [];
            if (startPoint) sorted.push(startPoint);
            sorted.push(...waypoints);
            if (endPoint) sorted.push(endPoint);

            return sorted;
        });
    };

    const removePoint = (id: string) => {
        hasUserChanges.current = true;
        setPoints(prev => prev.filter(p => p.id !== id));
    };

    const handleMapClick = (lat: number, lng: number) => {
        if (route?.mode !== 'manual') return;
        if (!isInsideCzechRepublic(lat, lng)) return;
        hasUserChanges.current = true;
        setPoints(prev => {
            const newPoint: EditorPoint = {
                id: uuidv4(),
                lat,
                lng,
                type: 'waypoint',
                name: prev.length === 0 ? 'Start' : `Bod ${prev.length + 1}`,
                order: prev.length
            };
            return reassignPointTypes([...prev, newPoint]);
        });
    };

    const insertPointOnSegment = useCallback((segmentIndex: number, lat: number, lng: number) => {
        if (!isInsideCzechRepublic(lat, lng)) return;
        hasUserChanges.current = true;
        setPoints(prev => {
            const insertAt = segmentIndex + 1;
            const newPoint: EditorPoint = {
                id: uuidv4(),
                lat,
                lng,
                type: 'waypoint',
                name: 'Bod',
                order: 0
            };
            const newPoints = [...prev];
            newPoints.splice(insertAt, 0, newPoint);
            return reassignPointTypes(newPoints);
        });
    }, []);

    const updatePointPosition = useCallback((id: string, lat: number, lng: number) => {
        hasUserChanges.current = true;
        if (!isInsideCzechRepublic(lat, lng)) {
            setPoints(prev => [...prev]);
            return;
        }
        setPoints(prev =>
            prev.map(p => p.id === id ? { ...p, lat, lng } : p)
        );
    }, []);

    const removeManualPoint = useCallback((id: string) => {
        hasUserChanges.current = true;
        setPoints(prev => reassignPointTypes(prev.filter(p => p.id !== id)));
    }, []);

    const moveManualPoint = useCallback((dragIndex: number, hoverIndex: number) => {
        hasUserChanges.current = true;
        setPoints(prev => {
            if (dragIndex < 0 || dragIndex >= prev.length || hoverIndex < 0 || hoverIndex >= prev.length) return prev;
            const newPoints = [...prev];
            const [draggedItem] = newPoints.splice(dragIndex, 1);
            newPoints.splice(hoverIndex, 0, draggedItem);
            return reassignPointTypes(newPoints);
        });
    }, []);

    const handleReset = useCallback(() => {
        setPoints([]);
    }, []);

    const saveChanges = async () => {
        if (!route) return;
        if (!hasUserChanges.current) return;

        const start = points.find(p => p.type === 'start');
        const end = points.find(p => p.type === 'end');
        const effectiveEnd = route.mode === 'manual' && points.length > 1 ? points[points.length - 1] : end;

        if (!start || !effectiveEnd) {
            throw new Error("Trasa musí mít alespoň začátek a cíl.");
        }

        const axisPoints = points.map(p => new LatLng(p.lat, p.lng));
        const axisLineString = leafletLatLngToGeoJsonLineString(axisPoints);

        const updatePayload: Record<string, unknown> = {
            start: latLngToGeoJsonPoint(start.lat, start.lng),
            end: latLngToGeoJsonPoint(effectiveEnd.lat, effectiveEnd.lng),
        };

        if (axisLineString.coordinates.length >= 2) {
            updatePayload.axis = axisLineString;
        }

        await updateRoute(route.id, updatePayload);

        if (route.waypoints && route.waypoints.length > 0) {
            await Promise.all(route.waypoints.map(wp => deleteWaypoint(wp.id)));
        }

        const waypointsToCreate = points.filter(p => p.type === 'waypoint');
        for (let i = 0; i < waypointsToCreate.length; i++) {
            const p = waypointsToCreate[i];
            await createWaypoint(route.id, i + 1, p.lat, p.lng);
        }

        const freshRoute = await fetchGetRoute(route.id);
        onUpdateRoute(freshRoute);
    };

    return {
        points,
        estimatedRoadKm,
        setStartPoint,
        setEndPoint,
        insertSimpleWaypoint,
        removePoint,
        movePoint,
        saveChanges,
        handleReset,
        handleMapClick,
        insertPointOnSegment,
        updatePointPosition,
        removeManualPoint,
        moveManualPoint,
    };
};
