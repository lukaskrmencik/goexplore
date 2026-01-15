import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Route, RouteMode } from "../../../types/routes";
import { createRoute, fetchGetRoute } from "../../../services/routesApiService";

export const STEPS = {
    INIT: 0,
    LOCATION: 1,
    DATE: 2,
    USERS: 3,
    EQUIPMENT: 4,
    CONFIG: 5, 
    FINISH: 6
};

export const useCreateRoute = () => {
    const [route, setRoute] = useState<Route | null>(null);
    const [currentStep, setCurrentStep] = useState<number>(STEPS.INIT);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const initializeRoute = async (mode: RouteMode) => {
        setIsLoading(true);
        setError(null);
        try {
            const newRoute = await createRoute(mode);
            setRoute(newRoute);
            setCurrentStep(STEPS.LOCATION);
        } catch (err) {
            setError("Nepodařilo se vytvořit trasu.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const loadRoute = useCallback(async (id: number) => {
        setIsLoading(true);
        try {
            const fetchedRoute = await fetchGetRoute(id);
            setRoute(fetchedRoute);
        } catch (err) {
            setError("Nepodařilo se načíst trasu.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const nextStep = () => {
        if (currentStep === STEPS.CONFIG) {
             // TODO: Final calculation logic
             return;
        }

        // Logic for skipping Config step in Simple mode
        if (route?.mode === 'simple' && currentStep === STEPS.EQUIPMENT) {
             setCurrentStep(STEPS.FINISH); 
        } else {
             setCurrentStep((prev) => prev + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > STEPS.LOCATION) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    return {
        route,
        currentStep,
        isLoading,
        error,
        initializeRoute,
        loadRoute,
        setRoute, 
        nextStep,
        prevStep
    };
};