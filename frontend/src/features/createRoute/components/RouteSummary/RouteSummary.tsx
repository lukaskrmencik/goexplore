import React from 'react';
import type { Route } from "../../../../types/routes";
import CalculationErrorHelper from '.././CalculationErrorHelper/CalculationErrorHelper';
import Spinner from "../../../../components/ui/Spinner/Spinner";
import './RouteSummary.css';

interface RouteSummaryProps {
    route: Route;
    isCalculating: boolean;
    calculationProgress: number; // 0-100
    calculationStatus: string;
    error?: string | null;
    onRetry?: () => void;
    onBack?: () => void;
}

/** Shown only when step is FINISH: loading (spinner + progress) or error. No separate "idle" page – user triggers generate from last step. */
const RouteSummary: React.FC<RouteSummaryProps> = ({
    route,
    calculationProgress,
    calculationStatus,
    error,
    onRetry,
    onBack
}) => {
    const displayStatus = (() => {
        const s = calculationStatus?.toString().trim().toLowerCase();
        if (s === "null" || s === "none" || s === "" || calculationStatus == null) return "Čekání";
        if (s === "running") return "Výpočet";
        return calculationStatus;
    })();

    if (error) {
        return (
            <CalculationErrorHelper
                error={error}
                routeMode={route.mode}
                currentBufferSize={route.buffer_size || 10}
                onRetry={onRetry!}
                onBack={onBack!}
            />
        );
    }

    return (
        <div className="route-summary-container">
            <div className="route-summary-content">
                <div className="route-summary-loading-wrapper">
                    <div className="route-summary-spinner-wrap">
                        <Spinner size="lg" className="route-summary-spinner" />
                    </div>
                    <h3 className="route-summary-title">Trasa se generuje...</h3>

                    <div className="route-summary-progress-wrapper">
                        <div className="route-summary-progress-bar">
                            <div
                                className="route-summary-progress-fill"
                                style={{ width: `${calculationProgress}%` }}
                            ></div>
                        </div>
                        <div className="route-summary-progress-labels">
                            <span>{displayStatus || "Inicializace..."}</span>
                            <span>{calculationProgress}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RouteSummary;
