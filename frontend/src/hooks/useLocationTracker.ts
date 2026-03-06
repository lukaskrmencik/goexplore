import { useEffect, useRef, useState, useCallback } from 'react';
import { updateUserLocation } from '../services/usersApiService';

export type LocationPermissionState = 'prompt' | 'granted' | 'denied' | 'unknown' | 'insecure_origin';

const DEFAULT_INTERVAL_MS = Number(import.meta.env.VITE_LOCATION_TRACKING_INTERVAL ?? "30000");
const GEO_TIMEOUT_MS = Number(import.meta.env.VITE_LOCATION_TRACKING_GEO_TIMEOUT ?? "10000");

export const useLocationTracker = (isAuthenticated: boolean, intervalMs = DEFAULT_INTERVAL_MS) => {
    const isTrackingRef = useRef(false);
    const [permissionState, setPermissionState] = useState<LocationPermissionState>('unknown');

    
    useEffect(() => {
        if (!window.isSecureContext) {
            setPermissionState('insecure_origin');
            return;
        }

        if (!('geolocation' in navigator)) {
            setPermissionState('denied');
            return;
        }

        if (navigator.permissions && navigator.permissions.query) {
            navigator.permissions.query({ name: 'geolocation' }).then((result) => {
                setPermissionState(result.state as LocationPermissionState);
                result.onchange = () => {
                    setPermissionState(result.state as LocationPermissionState);
                };
            }).catch(() => {
                setPermissionState('prompt');
            });
        } else {
            setPermissionState('prompt');
        }
    }, [isAuthenticated]);


    const syncLocation = useCallback(() => {
        if (isTrackingRef.current || !('geolocation' in navigator)) return;

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    isTrackingRef.current = true;
                    setPermissionState('granted');
                    const { longitude, latitude } = position.coords;
                    await updateUserLocation(longitude, latitude);
                } catch {
                } finally {
                    isTrackingRef.current = false;
                }
            },
            (error) => {
                if (error.code === error.PERMISSION_DENIED) {
                    setPermissionState('denied');
                }
            },
            {
                enableHighAccuracy: true,
                timeout: GEO_TIMEOUT_MS,
                maximumAge: 0,
            }
        );
    }, []);


    const requestPermission = useCallback(() => {
        syncLocation();
    }, [syncLocation]);


    useEffect(() => {
        if (!isAuthenticated || permissionState !== 'granted') return;

        syncLocation();
        const intervalId = setInterval(syncLocation, intervalMs);

        return () => clearInterval(intervalId);
    }, [isAuthenticated, permissionState, intervalMs, syncLocation]);


    return { permissionState, requestPermission };
};
