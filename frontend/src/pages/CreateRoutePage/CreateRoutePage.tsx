import { useState, useRef, useEffect } from "react";
import { useCreateRoute } from "../../features/createRoute/hooks/useCreateRoute";
import { getErrorMessage } from "../../utils/apiError";
import { WizardStep } from "../../types/wizard";
import type { RouteAxisEditorHandle, RouteDateEditorHandle, RouteConfigurationEditorHandle, EditorPoint } from "../../types/editor";
import { ChevronRight, ChevronLeft, Save, Trash2, Play } from "lucide-react";
import { computeEstimatedLength } from "../../utils/routeLengthEstimator";
import { geojsonPointToLatLng } from "../../utils/geo";

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
        goToStep,
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
    const [estimatedRoadKm, setEstimatedRoadKm] = useState(0);

    // Recalculate estimatedRoadKm from saved route data on page load/reload
    useEffect(() => {
        if (!route || estimatedRoadKm > 0) return;
        const points: EditorPoint[] = [];
        if (route.start) {
            const [lat, lng] = geojsonPointToLatLng(route.start) as [number, number];
            points.push({ id: 'start', lat, lng, type: 'start', name: 'Start', order: 0 });
        }
        if (route.waypoints?.length) {
            [...route.waypoints].sort((a, b) => a.order - b.order).forEach(wp => {
                const [lat, lng] = geojsonPointToLatLng(wp.coordinates) as [number, number];
                points.push({ id: `wp-${wp.id}`, lat, lng, type: 'waypoint', name: '', order: wp.order });
            });
        }
        if (route.end) {
            const [lat, lng] = geojsonPointToLatLng(route.end) as [number, number];
            points.push({ id: 'end', lat, lng, type: 'end', name: 'End', order: 9999 });
        }
        if (points.length >= 2) {
            setEstimatedRoadKm(computeEstimatedLength(points).roadKm);
        }
    }, [route]);

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

    /** Try to save the current editor silently (ignore errors). Returns true if save succeeded. */
    const trySilentSave = async (): Promise<boolean> => {
        try {
            if (currentStep === WizardStep.LOCATION && axisEditorRef.current) {
                await axisEditorRef.current.save();
            } else if (currentStep === WizardStep.DATE && dateEditorRef.current) {
                await dateEditorRef.current.save();
            } else if (currentStep === WizardStep.CONFIG && configEditorRef.current) {
                await configEditorRef.current.save();
            }
            return true;
        } catch {
            // Silently ignore save errors
            return false;
        }
    };

    const handleStepperClick = async (stepId: number) => {
        // Only allow clicking on steps before current (green ones)
        if (currentStep <= stepId) return;

        // Try to save current work silently (don't block navigation on failure)
        await trySilentSave();

        // Navigate to the clicked step
        goToStep(stepId);
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

    /** Last step: Vybavení (simple) or Nastavení (manual). Click "Generovat" → save, start calculation, go to loading page (FINISH). */
    const isLastStep =
        route?.mode === "simple" && currentStep === WizardStep.EQUIPMENT ||
        route?.mode === "manual" && currentStep === WizardStep.CONFIG;

    const handleGenerate = async () => {
        setLocalError(null);
        setIsSaving(true);
        try {
            if (currentStep === WizardStep.EQUIPMENT) {
                // nothing to save for equipment step
            } else if (currentStep === WizardStep.CONFIG && configEditorRef.current) {
                await configEditorRef.current.save();
            }

            await startCalculation();
            await nextStep();
        } catch (err: any) {
            console.error(err);
            setLocalError(getErrorMessage(err, "Nepodařilo se spustit výpočet."));
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

    const isFirstStep = currentStep === WizardStep.LOCATION;

    return (
        <div className="create-route-container">

            {/* 1. HEADER (Fixed Top of Container) */}
            <div className="create-route-header">
                <div className="create-route-header-inner">
                    <WizardStepper
                        currentStep={currentStep}
                        mode={route?.mode}
                        onStepClick={handleStepperClick}
                    />
                </div>
            </div>

            {/* 2. MAIN CONTENT (Flex-1, contains Map/Sheet) */}
            <div className="create-route-main">
                <div className="create-route-main-content">
                    {currentStep === WizardStep.LOCATION && route && (
                        <RouteAxisEditor
                            ref={axisEditorRef}
                            route={route}
                            onUpdate={setRoute}
                            onChange={() => {
                                if (axisEditorRef.current?.getEstimatedRoadKm) {
                                    setEstimatedRoadKm(axisEditorRef.current.getEstimatedRoadKm());
                                }
                            }}
                        />
                    )}

                    {currentStep === WizardStep.DATE && route && (
                        <div className="create-route-editor-scrollable">
                            <RouteDateEditor
                                ref={dateEditorRef}
                                route={route}
                                onUpdate={setRoute}
                                estimatedRoadKm={estimatedRoadKm}
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
                    <div className="create-route-footer-inner">
                        <Button
                            variant={isFirstStep ? "destructive" : "ghost"}
                            onClick={prevStep}
                            icon={isFirstStep ? Trash2 : ChevronLeft}
                            size="md"
                            className={isFirstStep ? "create-route-btn-delete" : "create-route-btn-back"}
                        >
                            {isFirstStep ? "Smazat" : "Zpět"}
                        </Button>

                        <Button
                            onClick={isLastStep ? handleGenerate : handleNext}
                            disabled={isSaving}
                            variant="primary"
                            rightIcon={isSaving ? undefined : (isLastStep ? Play : currentStep === WizardStep.CONFIG ? Save : ChevronRight)}
                            size="md"
                            className="create-route-btn-next"
                        >
                            {isSaving ? "Ukládám..." : isLastStep ? "Generovat" : (currentStep === WizardStep.CONFIG ? "Dokončit" : "Pokračovat")}
                        </Button>
                    </div>
                </div>
            )}

            <Toast message={displayError} onClose={handleClearError} />
        </div>
    );
};

export default CreateRoutePage;