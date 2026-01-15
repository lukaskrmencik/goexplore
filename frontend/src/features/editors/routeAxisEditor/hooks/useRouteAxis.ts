import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from 'uuid';
import type { Route } from "../../../../types/routes";
import { 
    updateRoute, 
    // createWaypoint, // Zatím nepoužito přímo, ale bude potřeba
    // deleteWaypoint 
} from "../../../../services/routesApiService";
import { 
    latLngToGeoJsonPoint, 
    geojsonPointToLatLng,
    leafletLatLngToGeoJsonLineString
} from "../../../../utils/geo";
import { LatLng } from "leaflet";

export interface EditorPoint {
    id: string; // Temporary UI ID
    dbId?: number; // Real DB ID (if saved)
    lat: number;
    lng: number;
    type: 'start' | 'end' | 'waypoint';
    name?: string;
    order: number;
}

export const useRouteAxis = (route: Route | null, onUpdateRoute: (route: Route) => void) => {
    const [points, setPoints] = useState<EditorPoint[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Load initial data from route object
    useEffect(() => {
        if (!route) return;

        const initialPoints: EditorPoint[] = [];

        if (route.start) {
            // OPRAVA: geojsonPointToLatLng bere celý Point objekt
            const coords = geojsonPointToLatLng(route.start) as [number, number];
            initialPoints.push({ id: 'start', lat: coords[0], lng: coords[1], type: 'start', name: 'Start', order: 0 });
        }

        if (route.waypoints && route.waypoints.length > 0) {
            // Seřadíme a namapujeme
            const sortedWaypoints = [...route.waypoints].sort((a, b) => a.order - b.order);
            
            sortedWaypoints.forEach(wp => {
                const coords = geojsonPointToLatLng(wp.coordinates) as [number, number];
                initialPoints.push({ 
                    id: `wp-${wp.id}`, 
                    dbId: wp.id, 
                    lat: coords[0], 
                    lng: coords[1], 
                    type: 'waypoint', 
                    name: `Waypoint ${wp.order}`, 
                    order: wp.order 
                });
            });
        }

        if (route.end) {
            const coords = geojsonPointToLatLng(route.end) as [number, number];
            initialPoints.push({ id: 'end', lat: coords[0], lng: coords[1], type: 'end', name: 'Cíl', order: 9999 });
        }

        setPoints(initialPoints);
    }, [route]);

    const addPoint = useCallback((lat: number, lng: number, name?: string) => {
        setPoints(prev => {
            const newPoints = [...prev];
            
            if (route?.mode === 'manual') {
                if (newPoints.length === 0) {
                    newPoints.push({ id: uuidv4(), lat, lng, type: 'start', name: 'Start', order: 0 });
                } else {
                    newPoints.push({ id: uuidv4(), lat, lng, type: 'waypoint', name: 'Bod trasy', order: newPoints.length });
                }
            }
            return newPoints;
        });
    }, [route?.mode]);

    // Simple Mode Specific setters
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

    // Save logic
    const saveChanges = async () => {
        if (!route) return;
        setIsSaving(true);
        try {
            const start = points.find(p => p.type === 'start');
            const end = points.find(p => p.type === 'end');
            const effectiveEnd = route.mode === 'manual' && points.length > 1 ? points[points.length - 1] : end;
            
            // 1. Update Start/End/Axis
            const axisPoints = points.map(p => new LatLng(p.lat, p.lng));
            const axisLineString = leafletLatLngToGeoJsonLineString(axisPoints);

            const updateData: any = {
                axis: axisLineString.coordinates.length >= 2 ? axisLineString : undefined
            };

            // OPRAVA: Použití správných funkcí z utils
            if (start) updateData.start = latLngToGeoJsonPoint(start.lat, start.lng);
            if (effectiveEnd) updateData.end = latLngToGeoJsonPoint(effectiveEnd.lat, effectiveEnd.lng);

            const updatedRoute = await updateRoute(route.id, updateData);
            
            // Aktualizujeme data v rodiči
            onUpdateRoute(updatedRoute);

            // TODO: Dořešit ukládání waypointů (API endpointy)
            
        } catch (e) {
            console.error("Failed to save route", e);
        } finally {
            setIsSaving(false);
        }
    };

    return {
        points,
        addPoint,
        setStartPoint,
        setEndPoint,
        addSimpleWaypoint,
        removePoint,
        saveChanges,
        isSaving
    };
};