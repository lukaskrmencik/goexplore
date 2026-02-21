import React, { useState } from 'react';
import { AlertCircle, RefreshCw, Settings2 } from "lucide-react";

interface CalculationErrorHelperProps {
    error: string;
    routeMode: 'simple' | 'manual';
    currentBufferSize?: number;
    onRetry: (newBufferSize?: number) => void;
    onBack: () => void;
}

const CalculationErrorHelper: React.FC<CalculationErrorHelperProps> = ({
    error,
    routeMode,
    currentBufferSize = 10,
    onRetry,
    onBack
}) => {
    const [bufferSize, setBufferSize] = useState<number>(currentBufferSize);

    return (
        <div className="w-full h-full flex items-center justify-center p-4 bg-slate-50">
            <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-600 mb-4 shadow-sm">
                    <AlertCircle size={48} />
                </div>

                <div className="space-y-4 px-4">
                    <h3 className="text-2xl md:text-3xl font-heading font-bold text-slate-900 leading-tight">
                        {error}
                    </h3>

                    {routeMode === 'manual' && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-left space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg shrink-0">
                                    <Settings2 size={20} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-slate-800 text-sm">Možná příčina: Malá oblast hledání</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        Častým důvodem, proč se nepodaří najít trasu, je příliš úzký koridor (buffer) kolem vaší trasy. Zkuste jej zvětšit.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-2 space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Velikost bufferu</label>
                                    <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                        {bufferSize} km
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="50"
                                    step="1"
                                    value={bufferSize}
                                    onChange={(e) => setBufferSize(parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600 hover:accent-emerald-700 transition-all"
                                />
                                <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1">
                                    <span>1 km</span>
                                    <span>50 km</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-3 pt-4">
                    <button
                        onClick={() => onRetry(routeMode === 'manual' ? bufferSize : undefined)}
                        className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={20} />
                        <span>Zkusit znovu {routeMode === 'manual' && `(${bufferSize} km)`}</span>
                    </button>

                    <button
                        onClick={onBack}
                        className="w-full py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 transition-colors"
                    >
                        Upravit zadání
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CalculationErrorHelper;
