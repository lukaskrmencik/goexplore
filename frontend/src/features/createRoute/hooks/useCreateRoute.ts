import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Route, RouteMode } from "../../../types/routes";
import { WizardStep, type WizardStepType } from "../../../types/wizard";
import { STEP_URLS, getStepFromUrl } from "../../../utils/wizardNav";
import { getFirstIncompleteStep } from "../../../utils/wizardCompletion";
import { createRoute, fetchGetRoute, updateRoute, calculateRoute, getCalculationProgress, deleteRoute } from "../../../services/routesApiService";
import { getErrorMessage } from "../../../utils/apiError";
import { SIMPLE_MODE_CONFIG } from "../../../config/simpleMode";
import { computeRouteEstimatedKm, computeDailyLimitFromRoute } from "../../../utils/routeLengthEstimator";

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
    const [retryStage, setRetryStage] = useState(0);

    const currentStep = getStepFromUrl(step);
    const prevStepRef = useRef<number | null>(null);

    useEffect(() => {
        if (routeId && (!route || route.id !== Number(routeId))) {
            setHasRedirected(false);
            loadRoute(routeId);
        }
    }, [routeId]);

    useEffect(() => {
        if (currentStep === WizardStep.LOCATION && routeId && route) {
            const prev = prevStepRef.current;
            prevStepRef.current = currentStep;

            if (prev !== null && prev !== WizardStep.LOCATION) {
                fetchGetRoute(Number(routeId)).then(setRoute).catch(() => {});
            }

        } else {
            prevStepRef.current = currentStep;
        }

    }, [currentStep, routeId, route]);

    useEffect(() => {

        if (route && !hasRedirected && routeId) {
            const firstIncomplete = getFirstIncompleteStep(route, route.mode);
            const targetUrl = STEP_URLS[firstIncomplete as WizardStepType];

            if (step === STEP_URLS[WizardStep.LOCATION] && targetUrl && targetUrl !== step) {
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

            const nextUrl = STEP_URLS[nextStepNum as WizardStepType];
            if (nextUrl) {
                navigate(`/routes/${route.id}/${nextUrl}`);
            }

        } catch (err) {
            setError(getErrorMessage(err, "Chyba při ukládání dat. Zkontrolujte prosím údaje."));

        } finally {
            setIsLoading(false);
        }
    };

    const goToStep = (stepId: number) => {

        if (!route) return;
        const url = STEP_URLS[stepId as WizardStepType];

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

        const prevUrl = STEP_URLS[prevStepNum as WizardStepType];

        if (prevStepNum >= WizardStep.LOCATION && prevUrl) {
            navigate(`/routes/${route.id}/${prevUrl}`);

        } else if (prevStepNum < WizardStep.LOCATION) {
            deleteRouteAndNavigateBack();
        }
    };

    const deleteRouteAndNavigateBack = async () => {

        if (!route) return;
        setIsLoading(true);

        try {
            await deleteRoute(route.id);

        } finally {
            setIsLoading(false);
            setRoute(null);
            navigate(`/routes/new`);
        }
    };

    const startCalculation = async (overrideBufferSize?: number) => {

        if (!route) return;
        setError(null);
        setIsCalculating(true);
        setCalculationProgress(0);
        setCalculationStatus("Inicializace...");

        try {
            let bufferToUse = route.buffer_size;

            if (route.mode === 'simple') {
                const stageIndex = overrideBufferSize ? 0 : retryStage;
                const stages = SIMPLE_MODE_CONFIG.BUFFER_RETRY_STAGES;
                bufferToUse = stages[stageIndex] ?? stages[stages.length - 1];

                if (stageIndex > 0) {
                    setCalculationStatus(`Zkouším rozšířený okruh (${bufferToUse} km)...`);
                }

                const estimatedRoadKm = computeRouteEstimatedKm(route);
                const computedDailyLimit = computeDailyLimitFromRoute(route, estimatedRoadKm);
                const dailyLimit = computedDailyLimit ?? SIMPLE_MODE_CONFIG.MAX_ROUTE_LENGTH_DAY;

                const updatedRoute = await updateRoute(route.id, {
                    buffer_size: bufferToUse,
                    max_route_length_day: dailyLimit,
                    poi_per_day: SIMPLE_MODE_CONFIG.POI_PER_DAY,
                });

                setRoute(updatedRoute);

            } else if (overrideBufferSize && overrideBufferSize !== route.buffer_size) {
            
                const updatedRoute = await updateRoute(route.id, { buffer_size: overrideBufferSize });
                setRoute(updatedRoute);
                bufferToUse = overrideBufferSize;
            }

            const jobId = await calculateRoute(route.id);

            pollCalculation(jobId, route.mode === 'simple' ? retryStage : -1);

        } catch (err) {
        
            setIsCalculating(false);
            setError(getErrorMessage(err, "Nepodařilo se spustit výpočet."));
        }
    };

    const pollCalculation = (jobId: string, currentRetryStage: number) => {

        const pollingInterval = Number(import.meta.env.VITE_CALCULATION_POLLING_INTERVAL ?? "2000");

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

                    if (currentRetryStage !== -1 && currentRetryStage < SIMPLE_MODE_CONFIG.BUFFER_RETRY_STAGES.length - 1) {
                        setRetryStage(prev => prev + 1);
                        setTimeout(() => {
                            handleSimpleRetry(currentRetryStage + 1);
                        }, 100);
                    } else {
                        setIsCalculating(false);
                        setError(progressData.error || "Výpočet selhal.");
                    }

                }
            } catch (err) {
                setError(getErrorMessage(err, "Nastala chyba při komunikaci se serverem."));
                setIsCalculating(false);
                clearInterval(interval);
            }

        }, pollingInterval);
    };

    const handleSimpleRetry = async (nextStage: number) => {

        setRetryStage(nextStage);
        const nextBuffer = SIMPLE_MODE_CONFIG.BUFFER_RETRY_STAGES[nextStage];
        setCalculationStatus(`Nenalezeno. Zkouším rozšířit hledání na ${nextBuffer} km...`);

        if (!route) return;

        const estimatedRoadKm = computeRouteEstimatedKm(route);
        const computedDailyLimit = computeDailyLimitFromRoute(route, estimatedRoadKm);
        const dailyLimit = computedDailyLimit ?? SIMPLE_MODE_CONFIG.MAX_ROUTE_LENGTH_DAY;

        try {
            const updatedRoute = await updateRoute(route.id, {
                buffer_size: nextBuffer,
                max_route_length_day: dailyLimit,
                poi_per_day: SIMPLE_MODE_CONFIG.POI_PER_DAY,
            });
            setRoute(updatedRoute);
            const jobId = await calculateRoute(route.id);
            pollCalculation(jobId, nextStage);

        } catch {
            setIsCalculating(false);
            setError("Chyba při opakovaném výpočtu.");
        }
    };

    const clearError = () => setError(null);

    return {
        route,
        currentStep,
        isLoading,
        error,
        clearError,
        initializeRoute,
        setRoute,
        nextStep,
        prevStep,
        goToStep,
        startCalculation,
        isCalculating,
        calculationProgress,
        calculationStatus,
    };
};
