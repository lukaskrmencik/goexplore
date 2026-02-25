import { useState, useEffect, useMemo, useCallback } from "react";
import { format, setHours, setMinutes, startOfDay } from "date-fns";
import type { Route, PaceInfo } from "../../../../types/routes";
import { updateRoute } from "../../../../services/routesApiService";
import { toInputDateTimeString, toIsoString, calculateDuration } from "../../../../utils/date";
import { getRouteLengthConstraints, isInSeason, getSeasonConstraints } from "../../../../utils/routeLengthEstimator";

const TIME_SLOT_INTERVAL_MINUTES = 15;

export const useRouteDate = (route: Route | null, onUpdateRoute: (route: Route) => void, estimatedRoadKm = 0) => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [activeField, setActiveField] = useState<'start' | 'end'>('start');

    useEffect(() => {
        if (route) {
            setStartDate(toInputDateTimeString(route.start_date));
            setEndDate(toInputDateTimeString(route.end_date));
        }
    }, [route]);

    const startDateObj = startDate ? new Date(startDate) : null;
    const endDateObj = endDate ? new Date(endDate) : null;
    const activeDateObj = activeField === 'start' ? startDateObj : endDateObj;

    const applyActiveFieldDate = useCallback((date: Date) => {
        const isoDate = format(date, "yyyy-MM-dd'T'HH:mm");
        if (activeField === 'start') {
            setStartDate(isoDate);
        } else {
            setEndDate(isoDate);
        }
    }, [activeField]);

    const handleDateSelect = useCallback((date: Date | null) => {
        if (!date) return;
        const currentActiveDateObj = activeField === 'start'
            ? (startDate ? new Date(startDate) : null)
            : (endDate ? new Date(endDate) : null);

        let newDate = new Date(date);
        if (currentActiveDateObj) {
            newDate = setHours(newDate, currentActiveDateObj.getHours());
            newDate = setMinutes(newDate, currentActiveDateObj.getMinutes());
        } else {
            const now = new Date();
            newDate = setHours(newDate, now.getHours());
            newDate = setMinutes(newDate, now.getMinutes());
        }
        applyActiveFieldDate(newDate);
    }, [activeField, startDate, endDate, applyActiveFieldDate]);

    const handleTimeSelect = useCallback((timeStr: string) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const currentActiveDateObj = activeField === 'start'
            ? (startDate ? new Date(startDate) : null)
            : (endDate ? new Date(endDate) : null);

        let newDate = currentActiveDateObj ? new Date(currentActiveDateObj) : new Date();
        newDate = setHours(newDate, hours);
        newDate = setMinutes(newDate, minutes);
        applyActiveFieldDate(newDate);
    }, [activeField, startDate, endDate, applyActiveFieldDate]);

    const handleReset = () => {
        setStartDate("");
        setEndDate("");
        setActiveField('start');
    };

    const handleSave = async () => {
        if (!route) return;

        const startIso = toIsoString(startDate);
        const endIso = toIsoString(endDate);

        if (!startIso || !endIso) {
            throw new Error("Musíte vyplnit oba datumy.");
        }

        const diffMs = new Date(endDate).getTime() - new Date(startDate).getTime();
        const minDurationHours = Number(import.meta.env.VITE_ROUTE_MIN_DURATION_HOURS ?? "3");

        if (diffMs < minDurationHours * 60 * 60 * 1000) {
            throw new Error(`Konec cesty musí být alespoň ${minDurationHours} hodiny po začátku.`);
        }

        const { minKmPerDay, maxKmPerDay, minDays } = getRouteLengthConstraints();
        const tripDays = diffMs / (1000 * 60 * 60 * 24);

        if (tripDays < minDays) {
            throw new Error(`Cesta musí trvat alespoň ${minDays} ${minDays === 1 ? 'den' : 'dny'} (vybráno: ${tripDays.toFixed(1)} dní).`);
        }

        if (estimatedRoadKm > 0) {
            const kmPerDay = estimatedRoadKm / tripDays;
            if (kmPerDay < minKmPerDay) {
                throw new Error(`Příliš pomalé tempo: ${Math.round(kmPerDay)} km/den (minimum je ${minKmPerDay} km/den). Zkraťte dobu cesty.`);
            }
            if (kmPerDay > maxKmPerDay) {
                throw new Error(`Příliš rychlé tempo: ${Math.round(kmPerDay)} km/den (maximum je ${maxKmPerDay} km/den). Produžťe dobu cesty.`);
            }
        }

        try {
            const updatedRoute = await updateRoute(route.id, { start_date: startIso, end_date: endIso });
            onUpdateRoute(updatedRoute);
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const duration = startDate && endDate ? calculateDuration(startDate, endDate) : null;

    const durationInfo = useMemo(() => {
        if (!startDate || !endDate) return null;
        const diffMs = new Date(endDate).getTime() - new Date(startDate).getTime();
        const { minDays } = getRouteLengthConstraints();
        if (diffMs <= 0) return { tripDays: 0, minDays, isTooShort: true };
        const tripDays = diffMs / (1000 * 60 * 60 * 24);
        return { tripDays, minDays, isTooShort: tripDays < minDays };
    }, [startDate, endDate]);

    const paceInfo = useMemo((): PaceInfo | null => {
        if (!startDate || !endDate || estimatedRoadKm <= 0) return null;
        const diffMs = new Date(endDate).getTime() - new Date(startDate).getTime();
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

    const timeSlots = useMemo(() => {
        const totalSlots = (24 * 60) / TIME_SLOT_INTERVAL_MINUTES;
        return Array.from({ length: totalSlots }, (_, i) => {
            const hours = Math.floor((i * TIME_SLOT_INTERVAL_MINUTES) / 60);
            const minutes = (i * TIME_SLOT_INTERVAL_MINUTES) % 60;
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        });
    }, []);

    const filterDate = useCallback((date: Date) => {
        if (!isInSeason(date)) return false;
        if (activeField === 'end' && startDate) {
            if (startOfDay(date).getTime() === startOfDay(new Date(startDate)).getTime()) return false;
        }
        if (activeField === 'start' && endDate) {
            if (startOfDay(date).getTime() === startOfDay(new Date(endDate)).getTime()) return false;
        }
        return true;
    }, [activeField, startDate, endDate]);

    const dayClassName = useCallback((date: Date): string => {
        if (!isInSeason(date)) return "day-off-season";

        const dayTimestamp = startOfDay(date).getTime();
        const startTimestamp = startDate ? startOfDay(new Date(startDate)).getTime() : 0;
        const endTimestamp = endDate ? startOfDay(new Date(endDate)).getTime() : 0;

        if (startTimestamp && endTimestamp && dayTimestamp > startTimestamp && dayTimestamp < endTimestamp) {
            return "range-intermediate";
        }
        if (startTimestamp && dayTimestamp === startTimestamp && activeField === 'end') {
            return "range-start-marker";
        }
        if (endTimestamp && dayTimestamp === endTimestamp && activeField === 'start') {
            return "range-end-marker";
        }
        return "";
    }, [startDate, endDate, activeField]);

    const openToDate = useMemo((): Date | undefined => {
        const currentActiveDateObj = activeField === 'start'
            ? (startDate ? new Date(startDate) : null)
            : (endDate ? new Date(endDate) : null);

        if (activeField === 'end' && !currentActiveDateObj && startDate) {
            return new Date(startDate);
        }
        if (!currentActiveDateObj) {
            const now = new Date();
            if (!isInSeason(now)) {
                const { startMonth } = getSeasonConstraints();
                const seasonStart = new Date(now.getFullYear(), startMonth - 1, 1);
                if (seasonStart <= now) {
                    seasonStart.setFullYear(now.getFullYear() + 1);
                }
                return seasonStart;
            }
        }
        return undefined;
    }, [activeField, startDate, endDate]);

    return {
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        activeField,
        setActiveField,
        activeDateObj,
        startDateObj,
        endDateObj,
        handleSave,
        handleReset,
        handleDateSelect,
        handleTimeSelect,
        duration,
        durationInfo,
        paceInfo,
        timeSlots,
        filterDate,
        dayClassName,
        openToDate,
    };
};
