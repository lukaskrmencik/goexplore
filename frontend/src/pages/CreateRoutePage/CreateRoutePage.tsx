import { useState, useRef } from "react";
import { useCreateRoute } from "../../features/createRoute/hooks/useCreateRoute";
import { getErrorMessage } from "../../utils/apiError";
import { WizardStep } from "../../types/wizard";
import type { RouteAxisEditorHandle, RouteDateEditorHandle, RouteConfigurationEditorHandle } from "../../types/editor";
import { ChevronRight, ChevronLeft, Save } from "lucide-react";

import RouteAxisEditor from "../../features/editors/routeAxisEditor/RouteAxisEditor/RouteAxisEditor";
import RouteDateEditor from "../../features/editors/routeDateEditor/RouteDateEditor/RouteDateEditor";
import RouteUsersEditor from "../../features/editors/routeUsersEditor/RouteUsersEditor/RouteUsersEditor";
import RouteEquipmentEditor from "../../features/editors/routeEquipmentEditor/RouteEquipmentEditor/RouteEquipmentEditor";
import RouteConfigurationEditor from "../../features/editors/routeConfigurationEditor/RouteConfigurationEditor/RouteConfigurationEditor";
import RouteSummary from "../../features/createRoute/components/RouteSummary/RouteSummary";
import RouteInitStep from "../../features/createRoute/components/RouteInitStep/RouteInitStep";

import { Button } from "../../components/ui/Button/Button";
import { WizardStepper } from "../../components/ui/WizardStepper/WizardStepper";
import Toast from "../../components/ui/Toast/Toast";
import type { RouteMode } from "../../types/routes";
import "./CreateRoutePage.css";

const CreateRoutePage = () => {
    const {
        route,
        currentStep,
        isLoading,
        error: hookError,
        clearError,
        initializeRoute,
        nextStep,
        prevStep,
        setRoute,
        startCalculation,
        isCalculating,
        calculationProgress,
        calculationStatus
    } = useCreateRoute();

    const axisEditorRef = useRef<RouteAxisEditorHandle>(null);
    const dateEditorRef = useRef<RouteDateEditorHandle>(null);
    const configEditorRef = useRef<RouteConfigurationEditorHandle>(null);

    const [localError, setLocalError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Don't show hook error in Toast on FINISH step (handled by RouteSummary)
    const displayError = localError || (currentStep !== WizardStep.FINISH ? hookError : null);

    const handleClearError = () => {
        setLocalError(null);
        clearError();
    };

    const handleInitialize = (mode: RouteMode, name: string) => {
        if (!name.trim()) {
            setLocalError("Zadejte prosím název trasy.");
            return;
        }
        setLocalError(null);
        initializeRoute(mode, name);
    };

    const handleNext = async () => {
        setLocalError(null);
        setIsSaving(true);
        try {
            if (currentStep === WizardStep.LOCATION && axisEditorRef.current) {
                await axisEditorRef.current.save();
            } else if (currentStep === WizardStep.DATE && dateEditorRef.current) {
                await dateEditorRef.current.save();
            } else if (currentStep === WizardStep.CONFIG && configEditorRef.current) {
                await configEditorRef.current.save();
            }

            await nextStep();

        } catch (err: any) {
            console.error(err);
            setLocalError(getErrorMessage(err, "Nastala neznámá chyba při ukládání."));
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading && !route) {
        return (
            <div className="create-route-loading">
                Načítám...
            </div>
        );
    }

    if (currentStep === WizardStep.INIT) {
        return (
            <>
                <RouteInitStep onInitialize={handleInitialize} />
                <Toast message={displayError} onClose={handleClearError} />
            </>
        );
    }

    // MAIN LAYOUT - NO WINDOW SCROLL POLICY
    // We calculate height to fit viewport minus Header(64px/56px) minus BottomNav(Mobile)
    // MAIN LAYOUT
    // MAIN LAYOUT - NO WINDOW SCROLL POLICY (STRICT REWRITE)
    // Adjusted for MainLayout: Header (h-14/56px), BottomNav (h-60px)
    return (
        // ROOT: Fixed between Header and BottomNav on mobile
        // DESKTOP: Fixed height calc(100vh - 64px) to account for MainLayout pt-16
        <div className="create-route-container">

            {/* 1. HEADER (Fixed Top of Container) */}
            <div className="create-route-header">
                <div className="create-route-header-inner">
                    <WizardStepper currentStep={currentStep} mode={route?.mode} />
                </div>
            </div>

            {/* 2. MAIN CONTENT (Flex-1, contains Map/Sheet) */}
            {/* Relative so absolute children position against it. No overflow-hidden here to allow sheet to slide? No, sheet is internal. */}
            <div className="create-route-main">
                <div className="create-route-main-content">
                    {currentStep === WizardStep.LOCATION && route && (
                        <RouteAxisEditor
                            ref={axisEditorRef}
                            route={route}
                            onUpdate={setRoute}
                        />
                    )}

                    {currentStep === WizardStep.DATE && route && (
                        <div className="create-route-editor-scrollable">
                            <RouteDateEditor
                                ref={dateEditorRef}
                                route={route}
                                onUpdate={setRoute}
                            />
                        </div>
                    )}

                    {currentStep === WizardStep.USERS && route && (
                        <div className="create-route-editor-scrollable">
                            <RouteUsersEditor route={route} onUpdate={setRoute} />
                        </div>
                    )}

                    {currentStep === WizardStep.EQUIPMENT && route && (
                        <div className="create-route-editor-scrollable">
                            <RouteEquipmentEditor route={route} onUpdate={setRoute} />
                        </div>
                    )}

                    {currentStep === WizardStep.CONFIG && route && (
                        <div className="create-route-editor-scrollable">
                            <RouteConfigurationEditor
                                ref={configEditorRef}
                                route={route}
                                onUpdate={setRoute}
                            />
                        </div>
                    )}

                    {currentStep === WizardStep.FINISH && route && (
                        <div className="create-route-editor-scrollable">
                            <RouteSummary
                                route={route}
                                isCalculating={isCalculating}
                                calculationProgress={calculationProgress}
                                calculationStatus={calculationStatus}
                                onCalculate={startCalculation}
                                error={hookError}
                                onRetry={startCalculation}
                                onBack={prevStep}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* 3. FOOTER (Fixed Bottom, Highest Z-Index) */}
            {currentStep !== WizardStep.FINISH && (
                <div className="create-route-footer">
                    {/* Inner container with pointer-events-auto for buttons */}
                    <div className="create-route-footer-inner">
                        <Button
                            variant="ghost"
                            onClick={prevStep}
                            icon={ChevronLeft}
                            size="md"
                            className="create-route-btn-back"
                        >
                            Zpět
                        </Button>

                        <Button
                            onClick={handleNext}
                            disabled={isSaving}
                            variant="primary"
                            rightIcon={isSaving ? undefined : (currentStep === WizardStep.CONFIG ? Save : ChevronRight)}
                            size="md"
                            className="create-route-btn-next"
                        >
                            {isSaving ? "Ukládám..." : (currentStep === WizardStep.CONFIG ? "Dokončit" : "Pokračovat")}
                        </Button>
                    </div>
                </div>
            )}

            <Toast message={displayError} onClose={handleClearError} />
        </div>
    );
};

export default CreateRoutePage;