import React from "react";
import type { RefObject } from "react";
import './WizardStepContent.css';
import { WizardStep } from "../../../../types/wizard";
import type { WizardStepType } from "../../../../types/wizard";
import type { Route } from "../../../../types/routes";
import type { RouteAxisEditorHandle, RouteDateEditorHandle, RouteConfigurationEditorHandle } from "../../../../types/editor";
import { computeRouteEstimatedKm } from "../../../../utils/routeLengthEstimator";

import RouteAxisEditor from "../../../../features/editors/routeAxisEditor/RouteAxisEditor/RouteAxisEditor";
import RouteDateEditor from "../../../../features/editors/routeDateEditor/RouteDateEditor/RouteDateEditor";
import RouteUsersEditor from "../../../../features/editors/routeUsersEditor/RouteUsersEditor/RouteUsersEditor";
import RouteEquipmentEditor from "../../../../features/editors/routeEquipmentEditor/RouteEquipmentEditor/RouteEquipmentEditor";
import RouteConfigurationEditor from "../../../../features/editors/routeConfigurationEditor/RouteConfigurationEditor/RouteConfigurationEditor";
import RouteGenerating from "../RouteGenerating/RouteGenerating";

interface WizardStepContentProps {
    currentStep: WizardStepType;
    route: Route;
    axisEditorRef: RefObject<RouteAxisEditorHandle | null>;
    dateEditorRef: RefObject<RouteDateEditorHandle | null>;
    configEditorRef: RefObject<RouteConfigurationEditorHandle | null>;
    calculationProgress: number;
    calculationStatus: string;
    calculationError: string | null;
    onRouteUpdate: (route: Route) => void;
    onEstimatedKmChange: (km: number) => void;
    onRetry: () => void;
    onBack: () => void;
}

const WizardStepContent: React.FC<WizardStepContentProps> = ({
    currentStep,
    route,
    axisEditorRef,
    dateEditorRef,
    configEditorRef,
    calculationProgress,
    calculationStatus,
    calculationError,
    onRouteUpdate,
    onEstimatedKmChange,
    onRetry,
    onBack,
}) => {
    if (currentStep === WizardStep.LOCATION) {
        return (
            <RouteAxisEditor
                ref={axisEditorRef}
                route={route}
                onUpdate={onRouteUpdate}
                onChange={() => {
                    if (axisEditorRef.current?.getEstimatedRoadKm) {
                        onEstimatedKmChange(axisEditorRef.current.getEstimatedRoadKm());
                    }
                }}
            />
        );
    }

    if (currentStep === WizardStep.DATE) {
        return (
            <div className="create-route-editor-scrollable">
                <RouteDateEditor
                    ref={dateEditorRef}
                    route={route}
                    onUpdate={onRouteUpdate}
                    estimatedRoadKm={computeRouteEstimatedKm(route)}
                />
            </div>
        );
    }

    if (currentStep === WizardStep.USERS) {
        return (
            <div className="create-route-editor-scrollable">
                <RouteUsersEditor route={route} onUpdate={onRouteUpdate} />
            </div>
        );
    }

    if (currentStep === WizardStep.EQUIPMENT) {
        return (
            <div className="create-route-editor-scrollable">
                <RouteEquipmentEditor route={route} onUpdate={onRouteUpdate} />
            </div>
        );
    }

    if (currentStep === WizardStep.CONFIG) {
        return (
            <div className="create-route-editor-scrollable">
                <RouteConfigurationEditor
                    ref={configEditorRef}
                    route={route}
                    onUpdate={onRouteUpdate}
                    estimatedRoadKm={computeRouteEstimatedKm(route)}
                />
            </div>
        );
    }

    if (currentStep === WizardStep.FINISH) {
        return (
            <div className="create-route-editor-scrollable">
                <RouteGenerating
                    route={route}
                    calculationProgress={calculationProgress}
                    calculationStatus={calculationStatus}
                    error={calculationError}
                    onRetry={onRetry}
                    onBack={onBack}
                />
            </div>
        );
    }

    return null;
};

export default WizardStepContent;
