import { useState } from "react";
import { calculateRoute, getCalculationProgress } from "../../../services/routesApiService";

const CALCULATION_POLLING_INTERVAL_MS = Number(import.meta.env.VITE_CALCULATION_POLLING_INTERVAL ?? "1000");
const COMPLETION_DISPLAY_DELAY_MS = 500;

export const useRouteRegeneration = (routeId: number | null | undefined, refetch: () => void) => {
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [regenStatus, setRegenStatus] = useState("");
    const [regenProgress, setRegenProgress] = useState(0);
    const [regenError, setRegenError] = useState<string | null>(null);
    const [isDirty, setIsDirty] = useState(false);

    const markAsDirty = () => setIsDirty(true);
    const clearRegenError = () => { setIsRegenerating(false); setRegenError(null); };

    const handleRegenerate = async () => {
        if (!routeId) return;
        if (routeId === 0) {
            setRegenError("Neplatné ID trasy");
            return;
        }

        setIsRegenerating(true);
        setRegenError(null);
        setRegenProgress(0);
        setRegenStatus("Spouštím výpočet...");

        try {
            const jobId = await calculateRoute(routeId);

            const interval = setInterval(async () => {
                try {
                    const progress = await getCalculationProgress(jobId);

                    if (progress.status) setRegenStatus(progress.status);
                    if (typeof progress.progress === 'number') setRegenProgress(progress.progress);

                    if (progress.status === 'done') {
                        clearInterval(interval);
                        setRegenProgress(100);
                        setTimeout(() => {
                            setIsRegenerating(false);
                            setRegenStatus("");
                            setRegenProgress(0);
                            setIsDirty(false);
                            refetch();
                        }, COMPLETION_DISPLAY_DELAY_MS);
                    } else if (progress.status === 'failed' || progress.error) {
                        clearInterval(interval);
                        setRegenError(progress.error || "Neznámá chyba při výpočtu.");
                    }
                } catch {
                    clearInterval(interval);
                    setRegenError("Chyba komunikace se serverem.");
                }
            }, CALCULATION_POLLING_INTERVAL_MS);
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Nepodařilo se spustit výpočet.";
            setRegenError(message);
        }
    };

    return {
        isRegenerating,
        regenStatus,
        regenProgress,
        regenError,
        isDirty,
        markAsDirty,
        handleRegenerate,
        clearRegenError,
    };
};
