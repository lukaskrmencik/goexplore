import { useState, useEffect, useMemo } from "react";
import type { Route, PaceInfo } from "../../../../types/routes";
import { updateRoute } from "../../../../services/routesApiService";
import { toInputDateTimeString, toIsoString, calculateDuration } from "../../../../utils/date";
import { getErrorMessage } from "../../../../utils/apiError";
import { getRouteLengthConstraints } from "../../../../utils/routeLengthEstimator";

export type { PaceInfo };

export const useRouteDate = (route: Route | null, onUpdateRoute: (route: Route) => void, estimatedRoadKm: number = 0) => {
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (route) {
            setStartDate(toInputDateTimeString(route.start_date));
            setEndDate(toInputDateTimeString(route.end_date));
        }
    }, [route]);

    const handleSave = async () => {
        if (!route) return;
        setError(null);

        const startIso = toIsoString(startDate);
        const endIso = toIsoString(endDate);

        if (!startIso || !endIso) {
            const msg = "Musíte vyplnit oba datumy.";
            setError(msg);
            throw new Error(msg);
        }

        const startObj = new Date(startDate);
        const endObj = new Date(endDate);
        const diffMs = endObj.getTime() - startObj.getTime();
        const minDurationHours = Number(import.meta.env.VITE_ROUTE_MIN_DURATION_HOURS ?? "3");
        const minDiff = minDurationHours * 60 * 60 * 1000;

        if (diffMs < minDiff) {
            const msg = `Konec cesty musí být alespoň ${minDurationHours} hodiny po začátku.`;
            setError(msg);
            throw new Error(msg);
        }

        // Validate minimum trip duration
        const { minKmPerDay, maxKmPerDay, minDays } = getRouteLengthConstraints();
        const tripDays = diffMs / (1000 * 60 * 60 * 24);

        if (tripDays < minDays) {
            const msg = `Cesta musí trvat alespoň ${minDays} ${minDays === 1 ? 'den' : 'dny'} (vybráno: ${tripDays.toFixed(1)} dní).`;
            setError(msg);
            throw new Error(msg);
        }

        // Validate pace if we have an estimated length
        if (estimatedRoadKm > 0) {
            const kmPerDay = estimatedRoadKm / tripDays;

            if (kmPerDay < minKmPerDay) {
                const msg = `Příliš pomalé tempo: ${Math.round(kmPerDay)} km/den (minimum je ${minKmPerDay} km/den). Zkraťte dobu cesty.`;
                setError(msg);
                throw new Error(msg);
            }
            if (kmPerDay > maxKmPerDay) {
                const msg = `Příliš rychlé tempo: ${Math.round(kmPerDay)} km/den (maximum je ${maxKmPerDay} km/den). Produžťe dobu cesty.`;
                setError(msg);
                throw new Error(msg);
            }
        }

        try {
            const updatedRoute = await updateRoute(route.id, {
                start_date: startIso,
                end_date: endIso
            });
            onUpdateRoute(updatedRoute);
        } catch (err) {
            console.error(err);
            const msg = getErrorMessage(err, "Nepodařilo se uložit datum. Zkontrolujte připojení.");
            setError(msg);
            throw err;
        }
    };

    const duration = startDate && endDate ? calculateDuration(startDate, endDate) : null;

    // Duration info for min-days validation in the UI
    const durationInfo = useMemo(() => {
        if (!startDate || !endDate) return null;
        const startObj = new Date(startDate);
        const endObj = new Date(endDate);
        const diffMs = endObj.getTime() - startObj.getTime();
        const { minDays } = getRouteLengthConstraints();
        if (diffMs <= 0) {
            return {
                tripDays: 0,
                minDays,
                isTooShort: true,
            };
        }
        const tripDays = diffMs / (1000 * 60 * 60 * 24);
        return {
            tripDays,
            minDays,
            isTooShort: tripDays < minDays,
        };
    }, [startDate, endDate]);

    // Pace info for UI display
    const paceInfo = useMemo((): PaceInfo | null => {
        if (!startDate || !endDate || estimatedRoadKm <= 0) return null;
        const startObj = new Date(startDate);
        const endObj = new Date(endDate);
        const diffMs = endObj.getTime() - startObj.getTime();
        if (diffMs <= 0) return null;
        const { minKmPerDay, maxKmPerDay } = getRouteLengthConstraints();
        const tripDays = diffMs / (1000 * 60 * 60 * 24);
        const kmPerDay = estimatedRoadKm / tripDays;
        return {
            tripDays,
            kmPerDay,
            minKmPerDay,
            maxKmPerDay,
            isUnderMin: kmPerDay < minKmPerDay,
            isOverMax: kmPerDay > maxKmPerDay,
            isValid: kmPerDay >= minKmPerDay && kmPerDay <= maxKmPerDay,
        };
    }, [startDate, endDate, estimatedRoadKm]);

    return {
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        handleSave,
        error,
        duration,
        durationInfo,
        paceInfo,
    };
};
