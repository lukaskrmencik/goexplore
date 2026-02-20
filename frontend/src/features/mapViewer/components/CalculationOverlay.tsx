import React from 'react';
import { Loader2, AlertTriangle, RefreshCw, X } from "lucide-react";

interface CalculationOverlayProps {
    isVisible: boolean;
    progress: number;
    status: string;
    error: string | null;
    onRetry: () => void;
    onCancel: () => void;
}

const CalculationOverlay: React.FC<CalculationOverlayProps> = ({
    isVisible,
    progress,
    status,
    error,
    onRetry,
    onCancel
}) => {
    if (!isVisible) return null;

    return (
        <div className="absolute bottom-4 right-4 z-[3000] animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto">
            <div className="w-80 bg-white p-4 rounded-xl shadow-2xl border border-slate-200/80 backdrop-blur-md">

                {error ? (
                    // Error State
                    <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0 text-red-600">
                            <AlertTriangle size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-slate-900 mb-1">Chyba výpočtu</h3>
                            <p className="text-xs text-slate-500 mb-2 leading-relaxed">{error}</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={onRetry}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
                                >
                                    <RefreshCw size={12} />
                                    Zkusit znovu
                                </button>
                                <button
                                    onClick={onCancel}
                                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
                                >
                                    Zavřít
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Loading State
                    <div className="flex gap-3 items-center">
                        <div className="relative w-8 h-8 shrink-0">
                            <div className="absolute inset-0 border-2 border-slate-100 rounded-full"></div>
                            <div className="absolute inset-0 border-2 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="text-sm font-bold text-slate-900">Přepočítávám...</h3>
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{Math.round(progress)}%</span>
                            </div>
                            <p className="text-xs text-slate-500 truncate">{status || "Hledám cesty..."}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CalculationOverlay;
