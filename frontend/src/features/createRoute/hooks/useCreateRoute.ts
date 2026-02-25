import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Route, RouteMode } from "../../../types/routes";
import { WizardStep } from "../../../types/wizard";
import { STEP_URLS, getStepFromUrl } from "../../../utils/wizardNav";
import { getCompletedSteps, getFirstIncompleteStep } from "../../../utils/wizardCompletion";
import {
    createRoute,
    fetchGetRoute,
    updateRoute,
    calculateRoute,
    getCalculationProgress,
    deleteRoute
} from "../../../services/routesApiService";
import { getErrorMessage } from "../../../utils/apiError";
import { SIMPLE_MODE_CONFIG } from "../../../config/simpleMode";

export const useCreateRoute = () => {
    const navigate = useNavigate();
    const { routeId, step } = useParams<{ routeId: string; step: string }>();

    const [route, setRoute] = useState<Route | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [hasRedirected, setHasRedirected] = useState(false);

    const [isCalculating, setIsCalculating] = useState(false);
    const [calculationProgress, setCalculationProgress] = useState(0);
    const [calculationStatus, setCalculationStatus] = useState("");

    const currentStep = getStepFromUrl(step);

    // Compute completed steps from route data
    const completedSteps = useMemo(() => {
        return getCompletedSteps(route, route?.mode);
    }, [route]);

    useEffect(() => {
        if (routeId && (!route || route.id !== Number(routeId))) {
            setHasRedirected(false);
            loadRoute(routeId);
        }
    }, [routeId]);

    // Resume: redirect to first incomplete step when route loads
    useEffect(() => {
        if (route && !hasRedirected && routeId) {
            const firstIncomplete = getFirstIncompleteStep(route, route.mode);
            const currentUrl = step;
            // @ts-ignore
            const targetUrl = STEP_URLS[firstIncomplete];

            // Only redirect if we're on the LOCATION step (default entry) 
            // and the first incomplete step is different
            if (currentUrl === STEP_URLS[WizardStep.LOCATION] && targetUrl && targetUrl !== currentUrl) {
                setHasRedirected(true);
                navigate(`/routes/${route.id}/${targetUrl}`, { replace: true });
            } else {
                setHasRedirected(true);
            }
        }
    }, [route, hasRedirected, routeId]);

    const initializeRoute = async (mode: RouteMode, name: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const newRoute = await createRoute(mode, name);
            setRoute(newRoute);
            navigate(`/routes/${newRoute.id}/${STEP_URLS[WizardStep.LOCATION]}`);
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err, "Nepodařilo se vytvořit trasu"));
        } finally {
            setIsLoading(false);
        }
    };

    const loadRoute = async (id: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const fetchedRoute = await fetchGetRoute(Number(id));
            setRoute(fetchedRoute);
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err, "Nepodařilo se načíst trasu"));
        } finally {
            setIsLoading(false);
        }
    };

    const nextStep = async () => {
        if (!route) return;
        setError(null);
        setIsLoading(true);

        try {
            let nextStepNum = currentStep + 1;

            if (route.mode === 'simple' && nextStepNum === WizardStep.CONFIG) {
                nextStepNum = WizardStep.FINISH;
            }

            // @ts-ignore
            if (STEP_URLS[nextStepNum]) {
                // @ts-ignore
                navigate(`/routes/${route.id}/${STEP_URLS[nextStepNum]}`);
            }
        } catch (err: any) {
            console.error(err);
            const msg = getErrorMessage(err, "Chyba při ukládání dat. Zkontrolujte prosím údaje.");
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const goToStep = (stepId: number) => {
        if (!route) return;
        // @ts-ignore
        const url = STEP_URLS[stepId];
        if (url) {
            navigate(`/routes/${route.id}/${url}`);
        }
    };

    const prevStep = () => {
        if (!route) return;
        let prevStepNum = currentStep - 1;

        if (route.mode === 'simple' && prevStepNum === WizardStep.CONFIG) {
            prevStepNum = WizardStep.EQUIPMENT;
        }

        // @ts-ignore
        if (prevStepNum >= WizardStep.LOCATION && STEP_URLS[prevStepNum]) {
            // @ts-ignore
            navigate(`/routes/${route.id}/${STEP_URLS[prevStepNum]}`);
        } else if (prevStepNum < WizardStep.LOCATION) {
            // On step 1, going back deletes the route
            handleDeleteAndGoBack();
        }
    };

    const handleDeleteAndGoBack = async () => {
        if (!route) return;
        setIsLoading(true);
        try {
            await deleteRoute(route.id);
        } catch (err) {
            console.error("Failed to delete route on back:", err);
            // Don't block navigation even if delete fails
        } finally {
            setIsLoading(false);
            setRoute(null);
            navigate(`/routes/new`);
        }
    };

    // Old pollCalculation removed to avoid duplication


    const [retryStage, setRetryStage] = useState(0);

    const startCalculation = async (overrideBufferSize?: number) => {
        if (!route) return;
        setError(null);
        setIsCalculating(true);
        setCalculationProgress(0);
        setCalculationStatus("Inicializace...");

        try {
            let bufferToUse = route.buffer_size;

            // SIMPLE MODE: Automatic buffer handling
            if (route.mode === 'simple') {
                // Determine buffer size based on retry stage
                const stageIndex = overrideBufferSize ? 0 : retryStage;
                // If overrideBufferSize is presented (e.g. manual restart), reset stage. 
                // Otherwise use current stage from config.

                const stages = SIMPLE_MODE_CONFIG.BUFFER_RETRY_STAGES;
                const nextBuffer = stages[stageIndex] || stages[stages.length - 1]; // Fallback to max

                bufferToUse = nextBuffer;

                if (stageIndex > 0) {
                    // Notify user about retry with larger buffer
                    // Ideally use a toast here, but for now we set status
                    setCalculationStatus(`Zkouším rozšířený okruh (${bufferToUse} km)...`);
                    // await new Promise(r => setTimeout(r, 1000)); // smooth transition
                }

                // Update route with new buffer
                const updatedRoute = await updateRoute(route.id, {
                    buffer_size: bufferToUse,
                    // Ensure other defaults are preserved or updated if needed
                    max_route_length_day: SIMPLE_MODE_CONFIG.MAX_ROUTE_LENGTH_DAY,
                    poi_per_day: SIMPLE_MODE_CONFIG.POI_PER_DAY
                });
                setRoute(updatedRoute);
            }
            // MANUAL MODE: Check for override from UI
            else if (overrideBufferSize && overrideBufferSize !== route.buffer_size) {
                const updatedRoute = await updateRoute(route.id, {
                    buffer_size: overrideBufferSize
                });
                setRoute(updatedRoute);
                bufferToUse = overrideBufferSize;
            }

            const jobId = await calculateRoute(route.id);
            pollCalculation(jobId, route.mode === 'simple' ? retryStage : -1);
        } catch (err) {
            console.error(err);
            setIsCalculating(false);
            setError(getErrorMessage(err, "Nepodařilo se spustit výpočet."));
        }
    };

    // Modified poll to handle simple mode retries
    const pollCalculation = async (jobId: string, currentRetryStage: number) => {
        const CALCULATION_POLLING_INTERVAL = Number(import.meta.env.VITE_CALCULATION_POLLING_INTERVAL ?? "2000");

        const interval = setInterval(async () => {
            try {
                const progressData = await getCalculationProgress(jobId);

                if (progressData.progress) setCalculationProgress(progressData.progress);
                if (progressData.status) setCalculationStatus(progressData.status);

                const hasError = progressData.state === 'failed' || progressData.status === 'Error' || !!progressData.error;

                if (progressData.state === 'completed' || (progressData.progress >= 100 && !hasError)) {
                    clearInterval(interval);
                    setIsCalculating(false);
                    setCalculationStatus("Hotovo!");
                    if (route?.id) {
                        navigate(`/map-viewer?id=${route.id}`);
                    }
                } else if (hasError) {
                    clearInterval(interval);

                    // RETRY LOGIC FOR SIMPLE MODE
                    if (currentRetryStage !== -1 && currentRetryStage < SIMPLE_MODE_CONFIG.BUFFER_RETRY_STAGES.length - 1) {
                        console.log(`Calculation failed at stage ${currentRetryStage}. Retrying with next stage...`);
                        setRetryStage(prev => prev + 1);
                        setTimeout(() => {
                            handleSimpleRetry(currentRetryStage + 1);
                        }, 100);

                    } else {
                        setIsCalculating(false);
                        setError(progressData.error || "Výpočet selhal.");
                    }
                }
            } catch (err: any) {
                console.error(err);
                const msg = getErrorMessage(err, "Nastala chyba při komunikaci se serverem.");
                setError(msg);
                setIsCalculating(false);
                clearInterval(interval);
            }
        }, CALCULATION_POLLING_INTERVAL);
    };

    const handleSimpleRetry = (nextStage: number) => {
        // Update state for UI consistency
        setRetryStage(nextStage);

        // Construct correct config update
        const stages = SIMPLE_MODE_CONFIG.BUFFER_RETRY_STAGES;
        const nextBuffer = stages[nextStage];

        setCalculationStatus(`Nenalezeno. Zkouším rozšířit hledání na ${nextBuffer} km...`);

        (async () => {
            try {
                if (!route) return;

                const updatedRoute = await updateRoute(route.id, {
                    buffer_size: nextBuffer,
                    max_route_length_day: SIMPLE_MODE_CONFIG.MAX_ROUTE_LENGTH_DAY,
                    poi_per_day: SIMPLE_MODE_CONFIG.POI_PER_DAY
                });
                setRoute(updatedRoute);

                const jobId = await calculateRoute(route.id);
                pollCalculation(jobId, nextStage);
            } catch (e) {
                setIsCalculating(false);
                setError("Chyba při opakovaném výpočtu.");
            }
        })();
    };

    const clearError = () => setError(null);

    return {
        route,
        currentStep,
        isLoading,
        error,
        clearError,
        initializeRoute,
        loadRoute,
        setRoute,
        nextStep,
        prevStep,
        goToStep,
        completedSteps,
        startCalculation,
        isCalculating,
        calculationProgress,
        calculationStatus
    };
};