import React from 'react';
import type { Route } from "../../../types/routes";
import { Loader2 } from "lucide-react";
import CalculationErrorHelper from './CalculationErrorHelper';

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

    // Auto-start calculation on mount ONLY if no error and not already calculating
    React.useEffect(() => {
        if (!isCalculating && !error) {
            onCalculate();
        }
    }, []); // Run once on mount

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
        <div className="w-full h-full flex items-start md:items-center justify-center p-4 bg-slate-50 overflow-y-auto">
            <div className="w-full max-w-4xl space-y-6 animate-in fade-in zoom-in-95 duration-300 pb-20 md:pb-0">

                {/* Loading State - Always visible now */}
                <div className="flex flex-col items-center justify-center py-12 md:py-20 text-center">
                    <div className="relative w-32 h-32 mb-8">
                        <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-emerald-600">
                            <Loader2 size={48} className="animate-pulse" />
                        </div>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-heading font-bold text-slate-900 mb-3">Pracuji na tom...</h3>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto px-4">
                        Naše AI právě hledá nejlepší cesty, kempy a zajímavá místa pro vaše dobrodružství.
                    </p>

                    <div className="w-full max-w-md px-4 space-y-3">
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                                style={{ width: `${calculationProgress}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
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
