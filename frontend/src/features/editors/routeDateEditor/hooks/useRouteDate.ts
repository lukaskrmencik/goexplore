import { useState, useEffect } from "react";
import type { Route } from "../../../../types/routes";
import { updateRoute } from "../../../../services/routesApiService";
import { toInputDateTimeString, toIsoString, calculateDuration } from "../../../../utils/date";
import { getErrorMessage } from "../../../../utils/apiError";

export const useRouteDate = (route: Route | null, onUpdateRoute: (route: Route) => void) => {
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
        const minDiff = 3 * 60 * 60 * 1000;

        if (diffMs < minDiff) {
            const msg = "Konec cesty musí být alespoň 3 hodiny po začátku.";
            setError(msg);
            throw new Error(msg);
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

    return {
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        handleSave,
        error,
        duration
    };
};
