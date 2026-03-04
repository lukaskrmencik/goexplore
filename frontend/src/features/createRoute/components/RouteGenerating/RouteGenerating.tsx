import React from 'react';
import type { Route } from "../../../../types/routes";
import CalculationErrorHelper from '.././CalculationErrorHelper/CalculationErrorHelper';
import Spinner from "../../../../components/ui/Spinner/Spinner";
import './RouteGenerating.css';

interface RouteGeneratingProps {
    route: Route;
    calculationProgress: number;
    calculationStatus: string;
    error?: string | null;
    onRetry?: () => void;
    onBack?: () => void;
}

function resolveStatusLabel(status: string): string {
    const normalized = status?.toString().trim().toLowerCase() ?? '';
    if (!normalized || normalized === 'null' || normalized === 'none') return 'Čekání';
    if (normalized === 'running') return 'Výpočet';
    return status;
}

const RouteGenerating: React.FC<RouteGeneratingProps> = ({
    route,
    calculationProgress,
    calculationStatus,
    error,
    onRetry,
    onBack,
}) => {
    if (error) {
        return (
            <CalculationErrorHelper
                error={error}
                routeMode={route.mode}
                currentBufferSize={route.buffer_size || Number(import.meta.env.VITE_CONFIG_DEFAULT_BUFFER_KM ?? "20")}
                onRetry={onRetry!}
                onBack={onBack!}
            />
        );
    }

    return (
        <div className="route-generating-container">
            <div className="route-generating-content">
                <div className="route-generating-loading-wrapper">
                    <div className="route-generating-spinner-wrap">
                        <Spinner size="lg" className="route-generating-spinner" />
                    </div>
                    <h3 className="route-generating-title">Trasa se generuje...</h3>

                    <div className="route-generating-progress-wrapper">
                        <div className="route-generating-progress-bar">
                            <div
                                className="route-generating-progress-fill"
                                style={{ width: `${calculationProgress}%` }}
                            ></div>
                        </div>
                        <div className="route-generating-progress-labels">
                            <span>{resolveStatusLabel(calculationStatus) || "Inicializace..."}</span>
                            <span>{calculationProgress}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RouteGenerating;
