import React from 'react';
import type { Route } from "../../../../types/routes";
import { Loader2, Play } from "lucide-react";
import CalculationErrorHelper from '.././CalculationErrorHelper/CalculationErrorHelper';
import { Button } from "../../../../components/ui/Button/Button";
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

                {isCalculating ? (
                    // Loading State – during active calculation
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
                ) : (
                    // Idle state – waiting for explicit user action
                    <div className="route-summary-loading-wrapper">
                        <div className="route-summary-spinner-container">
                            <div className="route-summary-spinner-track"></div>
                            <div className="route-summary-spinner-icon">
                                <Loader2 size={48} className="route-summary-icon-pulse" />
                            </div>
                        </div>
                        <h3 className="route-summary-title">Připraveno k výpočtu</h3>
                        <p className="route-summary-desc">
                            Máš zadanou trasu, termín i posádku. Až budeš připravený, spusť výpočet a my najdeme
                            konkrétní průběh trasy, kempy a zajímavá místa.
                        </p>

                        <div className="route-summary-progress-wrapper">
                            <Button
                                variant="primary"
                                size="md"
                                icon={Play}
                                onClick={onCalculate}
                            >
                                Spustit generování trasy
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RouteSummary;
