import React, { useState } from 'react';
import { AlertCircle, RefreshCw, Settings2 } from "lucide-react";
import './CalculationErrorHelper.css';

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
                                    min="1"
                                    max="50"
                                    step="1"
                                    value={bufferSize}
                                    onChange={(e) => setBufferSize(parseInt(e.target.value))}
                                    className="error-helper-slider"
                                />
                                <div className="error-helper-slider-marks">
                                    <span>1 km</span>
                                    <span>50 km</span>
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
};

export default CalculationErrorHelper;
