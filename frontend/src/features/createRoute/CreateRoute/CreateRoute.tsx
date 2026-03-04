import { useState, useRef } from "react";
import { useCreateRoute } from "../hooks/useCreateRoute";
import { getErrorMessage } from "../../../utils/apiError";
import { WizardStep } from "../../../types/wizard";
import type { RouteAxisEditorHandle, RouteDateEditorHandle, RouteConfigurationEditorHandle } from "../../../types/editor";
import type { RouteMode } from "../../../types/routes";

import RouteInitStep from "../components/RouteInitStep/RouteInitStep";
import WizardStepContent from "../components/WizardStepContent/WizardStepContent";
import WizardFooter from "../components/WizardFooter/WizardFooter";

import { WizardStepper } from "../../../components/ui/WizardStepper/WizardStepper";
import Toast from "../../../components/ui/Toast/Toast";
import "./CreateRoute.css";

const CreateRoute = () => {
    const {
        route,
        currentStep,
        isLoading,
        error: hookError,
        clearError,
        initializeRoute,
        nextStep,
        prevStep,
        goToStep,
        setRoute,
        startCalculation,
        calculationProgress,
        calculationStatus,
    } = useCreateRoute();

    const axisEditorRef = useRef<RouteAxisEditorHandle>(null);
    const dateEditorRef = useRef<RouteDateEditorHandle>(null);
    const configEditorRef = useRef<RouteConfigurationEditorHandle>(null);

    const [formError, setFormError] = useState<string | null>(null);
    const [isStepSaving, setIsStepSaving] = useState(false);

    const displayError = formError || (currentStep !== WizardStep.FINISH ? hookError : null);

    const handleClearError = () => {
        setFormError(null);
        clearError();
    };

    const handleInitialize = (mode: RouteMode, name: string) => {
        if (!name.trim()) {
            setFormError("Zadejte prosím název trasy.");
            return;
        }
        setFormError(null);
        initializeRoute(mode, name);
    };

    const saveCurrentEditor = async () => {
        if (currentStep === WizardStep.LOCATION) await axisEditorRef.current?.save();
        else if (currentStep === WizardStep.DATE) await dateEditorRef.current?.save();
        else if (currentStep === WizardStep.CONFIG) await configEditorRef.current?.save();
    };

    const trySilentSave = async () => {
        try {
            await saveCurrentEditor();
        } catch {
        }
    };

    const handleStepperClick = async (stepId: number) => {
        if (currentStep <= stepId) return;
        await trySilentSave();
        goToStep(stepId);
    };

    const handleNext = async () => {
        setFormError(null);
        setIsStepSaving(true);
        try {
            await saveCurrentEditor();
            await nextStep();
        } catch (err) {
            setFormError(getErrorMessage(err, "Nastala neznámá chyba při ukládání."));
        } finally {
            setIsStepSaving(false);
        }
    };

    const handleGenerate = async () => {
        setFormError(null);
        setIsStepSaving(true);
        try {
            await saveCurrentEditor();
            await startCalculation();
            await nextStep();
        } catch (err) {
            setFormError(getErrorMessage(err, "Nepodařilo se spustit výpočet."));
        } finally {
            setIsStepSaving(false);
        }
    };

    const isLastStep =
        (route?.mode === "simple" && currentStep === WizardStep.EQUIPMENT) ||
        (route?.mode === "manual" && currentStep === WizardStep.CONFIG);

    const isFirstStep = currentStep === WizardStep.LOCATION;

    if (isLoading && !route) {
        return <div className="create-route-loading">Načítám...</div>;
    }

    if (currentStep === WizardStep.INIT) {
        return (
            <>
                <RouteInitStep onInitialize={handleInitialize} />
                <Toast message={displayError} onClose={handleClearError} />
            </>
        );
    }

    return (
        <div className="create-route-container">
            <div className="create-route-header">
                <div className="create-route-header-inner">
                    <WizardStepper
                        currentStep={currentStep}
                        mode={route?.mode}
                        onStepClick={handleStepperClick}
                    />
                </div>
            </div>

            <div className="create-route-main">
                <div className="create-route-main-content">
                    {route && (
                        <WizardStepContent
                            currentStep={currentStep}
                            route={route}
                            axisEditorRef={axisEditorRef}
                            dateEditorRef={dateEditorRef}
                            configEditorRef={configEditorRef}
                            calculationProgress={calculationProgress}
                            calculationStatus={calculationStatus}
                            calculationError={hookError}
                            onRouteUpdate={setRoute}
                            onEstimatedKmChange={() => {}}
                            onRetry={startCalculation}
                            onBack={prevStep}
                        />
                    )}
                </div>
            </div>

            {currentStep !== WizardStep.FINISH && (
                <WizardFooter
                    currentStep={currentStep}
                    isFirstStep={isFirstStep}
                    isLastStep={isLastStep}
                    isStepSaving={isStepSaving}
                    onPrevStep={prevStep}
                    onNextStep={handleNext}
                    onGenerate={handleGenerate}
                />
            )}

            <Toast message={displayError} onClose={handleClearError} />
        </div>
    );
};

export default CreateRoute;
