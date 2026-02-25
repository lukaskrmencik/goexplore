import { useEffect, useRef, useState, useCallback } from 'react';
import { updateUserLocation } from '../services/usersApiService';

export type LocationPermissionState = 'prompt' | 'granted' | 'denied' | 'unknown' | 'insecure_origin';

const DEFAULT_INTERVAL_MS = Number(import.meta.env.VITE_LOCATION_TRACKING_INTERVAL ?? "30000");
const GEO_TIMEOUT_MS = Number(import.meta.env.VITE_LOCATION_TRACKING_GEO_TIMEOUT ?? "10000");

export const useLocationTracker = (isAuthenticated: boolean, intervalMs = DEFAULT_INTERVAL_MS) => {
    const isTrackingRef = useRef(false);
    const [permissionState, setPermissionState] = useState<LocationPermissionState>('unknown');

    // 1. Check initial permission state
    useEffect(() => {
        console.log("[LocationTracker] Checking hardware and permissions...");

        if (!window.isSecureContext) {
            console.warn("[LocationTracker] Browser is running in an insecure context (HTTP non-localhost). Geolocation API is disabled by the browser.");
            setPermissionState('insecure_origin');
            return;
        }

        if (!('geolocation' in navigator)) {
            console.log("[LocationTracker] Geolocation not supported or user not authenticated.");
            setPermissionState('denied');
            return;
        }

        if (navigator.permissions && navigator.permissions.query) {
            navigator.permissions.query({ name: 'geolocation' }).then((result) => {
                console.log("[LocationTracker] Initial Permission State:", result.state);
                setPermissionState(result.state as LocationPermissionState);
                result.onchange = () => {
                    console.log("[LocationTracker] Permission State Changed to:", result.state);
                    setPermissionState(result.state as LocationPermissionState);
                };
            }).catch((e) => {
                console.warn("[LocationTracker] API Permissions query failed, falling back to prompt.", e);
                setPermissionState('prompt');
            });
        } else {
            console.log("[LocationTracker] Permissions API not available. Going to default prompt.");
            // Safari fallback or restricted contexts
            setPermissionState('prompt');
        }
    }, [isAuthenticated]);

    // 2. The core sync function
    const syncLocation = useCallback(() => {
        if (isTrackingRef.current || !('geolocation' in navigator)) return;

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                console.log("[LocationTracker] Geolocation success! Coords:", position.coords);
                try {
                    isTrackingRef.current = true;
                    setPermissionState('granted');
                    const { longitude, latitude } = position.coords;
                    await updateUserLocation(longitude, latitude);
                    console.log("[LocationTracker] Successfully synced to backend.");
                } catch (error) {
                    console.error("[LocationTracker] Error syncing location to backend:", error);
                } finally {
                    isTrackingRef.current = false;
                }
            },
            (error) => {
                console.error("[LocationTracker] Geolocation block/error:", error.message, "Code:", error.code);
                // Code 1 is PERMISSION_DENIED. Can happen if HTTP or blocked.
                if (error.code === error.PERMISSION_DENIED) {
                    setPermissionState('denied');
                    console.warn("[LocationTracker] Permission explicitly denied or blocked by browser policy (e.g. non-HTTPS).");
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    console.warn("[LocationTracker] Position unavailable (device GPS issue?).");
                } else if (error.code === error.TIMEOUT) {
                    console.warn("[LocationTracker] Timeout reaching GPS.");
                }
            },
            {
                enableHighAccuracy: true,
                timeout: GEO_TIMEOUT_MS,
                maximumAge: 0
            }
        );
    }, []);

    // 3. User gesture requested trigger
    const requestPermission = useCallback(() => {
        console.log("[LocationTracker] Manual permission requested via button click.");
        syncLocation();
    }, [syncLocation]);

    // 4. Background Sync loop (only when granted)
    useEffect(() => {
        if (!isAuthenticated || permissionState !== 'granted') return;

        // Sync immediately when it becomes granted
        syncLocation();

        const intervalId = setInterval(syncLocation, intervalMs);

        return () => clearInterval(intervalId);
    }, [isAuthenticated, permissionState, intervalMs, syncLocation]);

    return { permissionState, requestPermission };
};
