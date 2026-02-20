import { useState, useEffect, useCallback } from "react";
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

export const useRouteAxis = (route: Route | null, onUpdateRoute: (route: Route) => void) => {
    const [points, setPoints] = useState<EditorPoint[]>([]);

    const [customModeFinished, setCustomModeFinished] = useState(false);

    useEffect(() => {
        if (!route) return;

        const cacheKey = `route_names_${route.id}`;
        let nameCache: Record<string, string> = {};
        try {
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                nameCache = JSON.parse(cached);
            }
        } catch (error) {
            console.error(error);
        }

        const initialPoints: EditorPoint[] = [];

        const getName = (lat: number, lng: number, defaultName: string) => {
            const key = `${lat.toFixed(6)},${lng.toFixed(6)}`;
            return nameCache[key] || defaultName;
        };

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

    const addPoint = useCallback((lat: number, lng: number, name?: string) => {
        setPoints(prev => {
            const newPoints = [...prev];

            if (route?.mode === 'manual') {
                if (newPoints.length === 0) {
                    newPoints.push({ id: uuidv4(), lat, lng, type: 'start', name: name || 'Start', order: 0 });
                } else {
                    newPoints.push({ id: uuidv4(), lat, lng, type: 'waypoint', name: name || 'Bod trasy', order: newPoints.length });
                }
            }
            return newPoints;
        });
    }, [route?.mode]);

    const setStartPoint = (lat: number, lng: number, name: string) => {
        setPoints(prev => {
            const filtered = prev.filter(p => p.type !== 'start');
            return [{ id: 'start', lat, lng, type: 'start', name, order: 0 }, ...filtered];
        });
    };

    const setEndPoint = (lat: number, lng: number, name: string) => {
        setPoints(prev => {
            const filtered = prev.filter(p => p.type !== 'end');
            return [...filtered, { id: 'end', lat, lng, type: 'end', name, order: 9999 }];
        });
    };

    const addSimpleWaypoint = (lat: number, lng: number, name: string) => {
        setPoints(prev => {
            const waypoints = prev.filter(p => p.type === 'waypoint');
            const maxOrder = waypoints.length > 0 ? Math.max(...waypoints.map(w => w.order)) : 0;

            const end = prev.find(p => p.type === 'end');
            const others = prev.filter(p => p.type !== 'end');

            const newWp: EditorPoint = { id: uuidv4(), lat, lng, type: 'waypoint', name, order: maxOrder + 1 };

            return end ? [...others, newWp, end] : [...others, newWp];
        });
    };

    const removePoint = (id: string) => {
        setPoints(prev => prev.filter(p => p.id !== id));
    };

    const handleReset = useCallback(() => {
        setPoints([]);
        setCustomModeFinished(false);
    }, []);

    const finishDrawing = async () => {
        setPoints(prev => {
            const newPoints = [...prev];
            if (newPoints.length > 1) {
                const last = newPoints[newPoints.length - 1];
                if (last.type !== 'end') {
                    newPoints[newPoints.length - 1] = { ...last, type: 'end', name: 'Cíl' };
                }
            }
            return newPoints;
        });
    };

    const handleCustomFinish = async () => {
        setCustomModeFinished(true);
        await finishDrawing();
    };

    const handleMapClick = (lat: number, lng: number) => {
        if (route?.mode === 'manual' && !customModeFinished) {
            addPoint(lat, lng);
        }
    };

    const saveChanges = async () => {
        if (!route) return;

        try {
            const start = points.find(p => p.type === 'start');
            const end = points.find(p => p.type === 'end');

            const effectiveEnd = route.mode === 'manual' && points.length > 1 ? points[points.length - 1] : end;

            // VALIDATION: Must have at least Start and End
            if (!start || !effectiveEnd) {
                throw new Error("Trasa musí mít alespoň začátek a cíl.");
            }

            const axisPoints = points.map(p => new LatLng(p.lat, p.lng));
            const axisLineString = leafletLatLngToGeoJsonLineString(axisPoints);

            const updateData: any = {
                axis: axisLineString.coordinates.length >= 2 ? axisLineString : undefined
            };

            if (updateData.axis === undefined) delete updateData.axis;

            if (start) {
                updateData.start = latLngToGeoJsonPoint(start.lat, start.lng);
            }
            if (effectiveEnd) {
                updateData.end = latLngToGeoJsonPoint(effectiveEnd.lat, effectiveEnd.lng);
            }

            await updateRoute(route.id, updateData);

            const currentWaypointIds = new Set(points.filter(p => p.type === 'waypoint' && p.dbId).map(p => p.dbId));
            const waypointsToDelete = route.waypoints?.filter(wp => !currentWaypointIds.has(wp.id)) || [];

            if (waypointsToDelete.length > 0) {
                await Promise.all(waypointsToDelete.map(wp => deleteWaypoint(wp.id)));
            }

            const waypointsToCreate = points.filter(p => p.type === 'waypoint' && !p.dbId);

            if (waypointsToCreate.length > 0) {
                await Promise.all(waypointsToCreate.map(p =>
                    createWaypoint(route.id, p.order, p.lat, p.lng)
                ));
            }

            const freshRoute = await fetchGetRoute(route.id);
            onUpdateRoute(freshRoute);

        } catch (error) {
            throw error;
        }
    };

    return {
        points,
        customModeFinished,
        setStartPoint,
        setEndPoint,
        addSimpleWaypoint,
        removePoint,
        saveChanges,
        handleReset,
        handleCustomFinish,
        handleMapClick
    };
};