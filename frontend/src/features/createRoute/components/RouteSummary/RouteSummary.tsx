import React from 'react';
import type { Route } from "../../../../types/routes";
import { Loader2 } from "lucide-react";
import CalculationErrorHelper from '.././CalculationErrorHelper/CalculationErrorHelper';
import './RouteSummary.css';

interface RouteSummaryProps {
    route: Route;
    isCalculating: boolean;
    calculationProgress: number; // 0-100
    calculationStatus: string;
    onCalculate: () => void;
    error?: string | null;
    onRetry?: () => void;
    onBack?: () => void;
}

const RouteSummary: React.FC<RouteSummaryProps> = ({
    route,
    isCalculating,
    calculationProgress,
    calculationStatus,
    onCalculate,
    error,
    onRetry,
    onBack
}) => {

    React.useEffect(() => {
        if (!isCalculating && !error) {
            onCalculate();
        }
    }, []);

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

                {/* Loading State - Always visible now */}
                <div className="route-summary-loading-wrapper">
                    <div className="route-summary-spinner-container">
                        <div className="route-summary-spinner-track"></div>
                        <div className="route-summary-spinner-ring"></div>
                        <div className="route-summary-spinner-icon">
                            <Loader2 size={48} className="route-summary-icon-pulse" />
                        </div>
                    </div>
                    <h3 className="route-summary-title">Pracuji na tom...</h3>
                    <p className="route-summary-desc">
                        Naše AI právě hledá nejlepší cesty, kempy a zajímavá místa pro vaše dobrodružství.
                    </p>

                    <div className="route-summary-progress-wrapper">
                        <div className="route-summary-progress-bar">
                            <div
                                className="route-summary-progress-fill"
                                style={{ width: `${calculationProgress}%` }}
                            ></div>
                        </div>
                        <div className="route-summary-progress-labels">
                            <span>{calculationStatus || "Inicializace..."}</span>
                            <span>{calculationProgress}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RouteSummary;
