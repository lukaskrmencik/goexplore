import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Route, RouteMode } from "../../../types/routes";
import { WizardStep } from "../../../types/wizard";
import { STEP_URLS, getStepFromUrl } from "../../../utils/wizardNav";
import {
    createRoute,
    fetchGetRoute,
    updateRoute,
    calculateRoute,
    getCalculationProgress
} from "../../../services/routesApiService";
import { getErrorMessage } from "../../../utils/apiError";
import { SIMPLE_MODE_CONFIG } from "../../../config/simpleMode";

export const useCreateRoute = () => {
    const navigate = useNavigate();
    const { routeId, step } = useParams<{ routeId: string; step: string }>();

    const [route, setRoute] = useState<Route | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [isCalculating, setIsCalculating] = useState(false);
    const [calculationProgress, setCalculationProgress] = useState(0);
    const [calculationStatus, setCalculationStatus] = useState("");

    const currentStep = getStepFromUrl(step);

    useEffect(() => {
        if (routeId && (!route || route.id !== Number(routeId))) {
            loadRoute(routeId);
        }
    }, [routeId]);

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
                        setRetryStage(prev => prev + 1);
                        // Trigger next attempt immediately
                        // We need to use recursion carefully or useEffect. 
                        // Since startCalculation relies on state, it's safer to call it again.
                        // However, state updates (setRetryStage) are async.
                        // But we passed currentRetryStage as arg to pollCalculation to track it.

                        // We need to force a re-run. 
                        // To avoid infinite loops or stack overflow, we use setTimeout.
                        setTimeout(() => {
                            // We must manually increment stage for the function call, as state might not match yet inside closure
                            // Actually, better to rely on the updated state in next render or force it here.
                            // Let's refactor startCalculation to accept stage explicitly? 
                            // Easier: just update state and let a useEffect trigger? 
                            // No, explicit call is better.

                            // We can't access the *new* state here easily.
                            // But we know we want (currentRetryStage + 1).

                            // We need to update the route buffer first. 
                            // Let's recursively call a special internal retry function or just startCalculation.
                            // But startCalculation reads "retryStage" from state.
                            // So we MUST update state first.

                            // Problem: setRetryStage is async. 
                            // Workaround: We will use a temp variable or pass stage to startCalculation.
                            // But startCalculation is designed to read from state for existing implementation?
                            // No, I just modified it to read from state. 

                            // FIXED: I will modify startCalculation to NOT depend on state for the *next* buffer, 
                            // OR I will simply trigger it after state update.

                            // Let's try this:
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
        }, 2000);
    };

    const handleSimpleRetry = (nextStage: number) => {
        // Update state for UI consistency
        setRetryStage(nextStage);

        // Construct correct config update
        const stages = SIMPLE_MODE_CONFIG.BUFFER_RETRY_STAGES;
        const nextBuffer = stages[nextStage];

        // Notify user
        // toast.info(`Nenalezeno. Zkouším rozšířit hledání na ${nextBuffer} km...`);
        setCalculationStatus(`Nenalezeno. Zkouším rozšířit hledání na ${nextBuffer} km...`);

        // Call backend updates + calc
        // We reuse logic but bypass startCalculation's state dependency by calling a helper or just updating route here.

        // Actually best is to just call startCalculation() but we need it to use the NEW stage.
        // But startCalculation reads state `retryStage`.
        // If we setRetryStage(nextStage), on next render it is fine. 
        // But we are in an interval callback (closure).

        // We can just execute the logic directly here:
        (async () => {
            try {
                if (!route) return; // Should not happen

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
        startCalculation,
        isCalculating,
        calculationProgress,
        calculationStatus
    };
};