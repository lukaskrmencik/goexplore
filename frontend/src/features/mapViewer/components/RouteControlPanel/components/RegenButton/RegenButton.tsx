import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import './RegenButton.css';

interface RegenButtonProps {
    isRegenerating: boolean;
    regenProgress: number;
    isDirty: boolean;
    onRegenerate: () => void;
}

interface ContentProps {
    isRegenerating: boolean;
    regenProgress: number;
    isDirty: boolean;
}

{/* --- START: AI-GENERATED UI (Claude 3.7 Sonnet Thinking) --- */}
{/* Layout and structure generated from design. Data binding and variables added manually. */}

const RegenButtonContent: React.FC<ContentProps> = ({ isRegenerating, regenProgress, isDirty }) => (
    <>
        <RefreshCw size={18} className={isRegenerating ? 'animate-spin' : ''} />
        <span className="route-control-panel-regen-label">
            {isRegenerating ? `Přepočítávám ${Math.round(regenProgress)}%` : 'Přegenerovat trasu'}
        </span>
        {isDirty && !isRegenerating && <AlertTriangle size={16} className="animate-pulse" />}
    </>
);

const RegenButton: React.FC<RegenButtonProps> = ({ isRegenerating, regenProgress, isDirty, onRegenerate }) => (
    <button
        onClick={onRegenerate}
        disabled={isRegenerating}
        className={`route-control-panel-regen-btn ${!isRegenerating && isDirty ? 'route-control-panel-regen-dirty' : 'route-control-panel-regen-clean'}`}
    >
        <div className={`route-control-panel-regen-bg ${isRegenerating ? 'route-control-panel-regen-bg-running' : isDirty ? 'route-control-panel-regen-bg-dirty' : 'route-control-panel-regen-bg-clean'}`} />

        {isRegenerating && (
            <div
                className="route-control-panel-regen-progress"
                style={{ transform: `scaleX(${regenProgress / 100})` }}
            />
        )}

        {isRegenerating ? (
            <>
                <div
                    className="route-control-panel-regen-content route-control-panel-regen-text-unfilled"
                    style={{ opacity: 1 - regenProgress / 100 }}
                >
                    <RegenButtonContent isRegenerating={isRegenerating} regenProgress={regenProgress} isDirty={isDirty} />
                </div>
                <div
                    className="route-control-panel-regen-content route-control-panel-regen-text-filled"
                    style={{ opacity: regenProgress / 100 }}
                >
                    <RegenButtonContent isRegenerating={isRegenerating} regenProgress={regenProgress} isDirty={isDirty} />
                </div>
            </>
        ) : (
            <div className="route-control-panel-regen-content route-control-panel-regen-text-light">
                <RegenButtonContent isRegenerating={isRegenerating} regenProgress={regenProgress} isDirty={isDirty} />
            </div>
        )}
    </button>
);

{/* --- END: AI-GENERATED UI --- */}

export default RegenButton;
