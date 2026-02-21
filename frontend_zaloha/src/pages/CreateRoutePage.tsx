import { useState, useRef } from "react";
import { useCreateRoute } from "../features/createRoute/hooks/useCreateRoute";
import { getErrorMessage } from "../utils/apiError";
import { WizardStep } from "../types/wizard";
import type { RouteAxisEditorHandle, RouteDateEditorHandle, RouteConfigurationEditorHandle } from "../types/editor";
import { ChevronRight, ChevronLeft, Save } from "lucide-react";

import RouteAxisEditor from "../features/editors/routeAxisEditor/RouteAxisEditor";
import RouteDateEditor from "../features/editors/routeDateEditor/RouteDateEditor";
import RouteUsersEditor from "../features/editors/routeUsersEditor/RouteUsersEditor";
import RouteEquipmentEditor from "../features/editors/routeEquipmentEditor/RouteEquipmentEditor";
import RouteConfigurationEditor from "../features/editors/routeConfigurationEditor/RouteConfigurationEditor";
import RouteSummary from "../features/createRoute/components/RouteSummary";
import RouteInitStep from "../features/createRoute/components/RouteInitStep";

import { Button } from "../components/ui/Button";
import { WizardStepper } from "../components/ui/WizardStepper";
import Toast from "../components/ui/Toast";
import type { RouteMode } from "../types/routes";

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
            <div className="flex h-[50vh] items-center justify-center text-slate-500 font-bold animate-pulse">
                Načítám...
            </div>
        );
    }

    if (currentStep === WizardStep.INIT) {
        return (
            <>
                <RouteInitStep onInitialize={handleInitialize} error={displayError} />
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
        <div className="fixed top-14 bottom-[60px] left-0 right-0 md:static md:w-full md:h-[calc(100vh-64px)] bg-slate-50 flex flex-col overflow-hidden z-40">

            {/* 1. HEADER (Fixed Top of Container) */}
            <div className="flex-none z-30 px-4 pt-4 pb-4 md:pt-6">
                <div className="max-w-7xl mx-auto w-full">
                    <WizardStepper currentStep={currentStep} mode={route?.mode} />
                </div>
            </div>

            {/* 2. MAIN CONTENT (Flex-1, contains Map/Sheet) */}
            {/* Relative so absolute children position against it. No overflow-hidden here to allow sheet to slide? No, sheet is internal. */}
            <div className="flex-1 relative w-full max-w-7xl mx-auto md:px-4 md:pb-6 overflow-hidden">
                <div className="relative w-full h-full md:rounded-3xl md:border md:border-slate-200 md:shadow-xl md:overflow-hidden bg-white">
                    {currentStep === WizardStep.LOCATION && route && (
                        <RouteAxisEditor
                            ref={axisEditorRef}
                            route={route}
                            onUpdate={setRoute}
                        />
                    )}

                    {currentStep === WizardStep.DATE && route && (
                        <div className="h-full overflow-y-auto">
                            <RouteDateEditor
                                ref={dateEditorRef}
                                route={route}
                                onUpdate={setRoute}
                            />
                        </div>
                    )}

                    {currentStep === WizardStep.USERS && route && (
                        <div className="h-full overflow-y-auto">
                            <RouteUsersEditor route={route} onUpdate={setRoute} />
                        </div>
                    )}

                    {currentStep === WizardStep.EQUIPMENT && route && (
                        <div className="h-full overflow-y-auto">
                            <RouteEquipmentEditor route={route} onUpdate={setRoute} />
                        </div>
                    )}

                    {currentStep === WizardStep.CONFIG && route && (
                        <div className="h-full overflow-y-auto">
                            <RouteConfigurationEditor
                                ref={configEditorRef}
                                route={route}
                                onUpdate={setRoute}
                            />
                        </div>
                    )}

                    {currentStep === WizardStep.FINISH && route && (
                        <div className="h-full overflow-y-auto">
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
                <div className="flex-none z-50 w-full max-w-7xl mx-auto px-4 pb-8 pt-4 pointer-events-none">
                    {/* Inner container with pointer-events-auto for buttons */}
                    <div className="flex flex-row items-center justify-between gap-4 pointer-events-auto">
                        <Button
                            variant="ghost"
                            onClick={prevStep}
                            icon={ChevronLeft}
                            size="md"
                            className="bg-white/90 backdrop-blur-sm shadow-sm border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold px-4 rounded-xl transition-all active:scale-95 flex items-center"
                        >
                            Zpět
                        </Button>

                        <Button
                            onClick={handleNext}
                            disabled={isSaving}
                            variant="primary"
                            rightIcon={isSaving ? undefined : (currentStep === WizardStep.CONFIG ? Save : ChevronRight)}
                            size="md"
                            className="font-bold px-6 rounded-xl shadow-lg shadow-emerald-500/30 transition-all active:scale-95 flex items-center justify-center text-center"
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