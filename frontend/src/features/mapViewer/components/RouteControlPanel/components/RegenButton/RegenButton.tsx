import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface RegenButtonProps {
    isRegenerating: boolean;
    regenProgress: number;
    isDirty: boolean;
    onRegenerate: () => void;
}

const RegenButton: React.FC<RegenButtonProps> = ({ isRegenerating, regenProgress, isDirty, onRegenerate }) => (
    <button
        onClick={onRegenerate}
        disabled={isRegenerating}
        className={`route-control-panel-regen-btn ${!isRegenerating && isDirty ? 'route-control-panel-regen-dirty' : 'route-control-panel-regen-clean'}`}
    >
        <div className={`route-control-panel-regen-bg ${isRegenerating ? 'route-control-panel-regen-bg-running' : isDirty ? 'route-control-panel-regen-bg-dirty' : 'route-control-panel-regen-bg-clean'}`} />
        <div
            className="route-control-panel-regen-progress"
            style={{ transform: `scaleX(${isRegenerating ? regenProgress / 100 : 0})`, opacity: isRegenerating ? 1 : 0 }}
        />
        <div className={`route-control-panel-regen-content ${isRegenerating && regenProgress < 50 ? 'route-control-panel-regen-text-dark' : 'route-control-panel-regen-text-light'}`}>
            <RefreshCw size={18} className={isRegenerating ? "animate-spin" : ""} />
            <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>
                {isRegenerating ? `Přepočítávám ${Math.round(regenProgress)}%` : "Přegenerovat trasu"}
            </span>
            {isDirty && !isRegenerating && <AlertTriangle size={16} className="animate-pulse" />}
        </div>
    </button>
);

export default RegenButton;
