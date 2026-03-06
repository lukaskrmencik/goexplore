import React, { useState } from 'react';
import { AlertCircle, RefreshCw, Settings2 } from "lucide-react";
import './CalculationErrorHelper.css';

const DEFAULT_BUFFER_KM = Number(import.meta.env.VITE_CONFIG_DEFAULT_BUFFER_KM ?? "20");
const BUFFER_MIN_KM = Number(import.meta.env.VITE_CONFIG_BUFFER_MIN_KM ?? "1");
const BUFFER_MAX_KM = Number(import.meta.env.VITE_CONFIG_BUFFER_MAX_KM ?? "50");

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
    currentBufferSize = DEFAULT_BUFFER_KM,
    onRetry,
    onBack,
}) => {

    const [bufferSize, setBufferSize] = useState<number>(currentBufferSize);

    {/* --- START: AI-GENERATED UI (Claude 3.7 Sonnet Thinking) --- */}
    {/* Layout and structure generated from design. Data binding and variables added manually. */}

    return (
        <div className="error-helper-container">
            <div className="error-helper-content">
                <div className="error-helper-icon-wrapper">
                    <AlertCircle size={48} />
                </div>

                <div className="error-helper-text-container">
                    <h3 className="error-helper-title">
                        {error}
                    </h3>

                    {routeMode === 'manual' && (
                        <div className="error-helper-manual-card">
                            <div className="error-helper-manual-header">
                                <div className="error-helper-manual-icon">
                                    <Settings2 size={20} />
                                </div>
                                <div>
                                    <h4 className="error-helper-manual-title">Možná příčina: Malá oblast hledání</h4>
                                    <p className="error-helper-manual-desc">
                                        Častým důvodem, proč se nepodaří najít trasu, je příliš úzký koridor (buffer) kolem vaší trasy. Zkuste jej zvětšit.
                                    </p>
                                </div>
                            </div>

                            <div className="error-helper-slider-container">
                                <div className="error-helper-slider-header">
                                    <label className="error-helper-slider-label">Velikost bufferu</label>
                                    <span className="error-helper-slider-value">
                                        {bufferSize} km
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min={BUFFER_MIN_KM}
                                    max={BUFFER_MAX_KM}
                                    step="1"
                                    value={bufferSize}
                                    onChange={(e) => setBufferSize(parseInt(e.target.value))}
                                    className="error-helper-slider"
                                />
                                <div className="error-helper-slider-marks">
                                    <span>{BUFFER_MIN_KM} km</span>
                                    <span>{BUFFER_MAX_KM} km</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="error-helper-actions">
                    <button
                        onClick={() => onRetry(routeMode === 'manual' ? bufferSize : undefined)}
                        className="error-helper-btn-retry"
                    >
                        <RefreshCw size={20} />
                        <span>Zkusit znovu {routeMode === 'manual' && `(${bufferSize} km)`}</span>
                    </button>

                    <button
                        onClick={onBack}
                        className="error-helper-btn-back"
                    >
                        Upravit zadání
                    </button>
                </div>
            </div>
        </div>
    );

    {/* --- END: AI-GENERATED UI --- */}
};

export default CalculationErrorHelper;
