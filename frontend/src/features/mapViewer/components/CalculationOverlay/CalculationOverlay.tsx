import React from 'react';
import { AlertTriangle, RefreshCw } from "lucide-react";
import "./CalculationOverlay.css";

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
        <div className="calc-overlay-container">
            <div className="calc-overlay-card">

                {error ? (
                    <div className="calc-overlay-error-row">
                        <div className="calc-overlay-error-icon-box">
                            <AlertTriangle size={16} />
                        </div>
                        <div className="calc-overlay-content">
                            <h3 className="calc-overlay-error-title">Chyba výpočtu</h3>
                            <p className="calc-overlay-error-desc">{error}</p>
                            <div className="calc-overlay-error-actions">
                                <button
                                    onClick={onRetry}
                                    className="calc-overlay-btn-retry"
                                >
                                    <RefreshCw size={12} />
                                    Zkusit znovu
                                </button>
                                <button
                                    onClick={onCancel}
                                    className="calc-overlay-btn-cancel"
                                >
                                    Zavřít
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="calc-overlay-loading-row">
                        <div className="calc-overlay-loading-spinner-box">
                            <div className="calc-overlay-loading-spinner-bg"></div>
                            <div className="calc-overlay-loading-spinner-fg"></div>
                        </div>
                        <div className="calc-overlay-content">
                            <div className="calc-overlay-loading-header">
                                <h3 className="calc-overlay-loading-title">Přepočítávám...</h3>
                                <span className="calc-overlay-loading-percent">{Math.round(progress)}%</span>
                            </div>
                            <p className="calc-overlay-loading-desc">{status || "Hledám trasy..."}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CalculationOverlay;
