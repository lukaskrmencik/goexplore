import { AlertTriangle } from "lucide-react";
import './DurationPill.css';

interface DurationInfo {
    isTooShort: boolean;
    minDays: number;
}

interface DurationPillProps {
    duration: string | null;
    durationInfo: DurationInfo | null;
}

const DurationPill: React.FC<DurationPillProps> = ({ duration, durationInfo }) => {

    {/* --- START: AI-GENERATED UI (Claude 3.7 Sonnet Thinking) --- */}
    {/* Layout and structure generated from design. Data binding and variables added manually. */}

    return (
        <div className="route-date-editor-duration-wrapper">
            {duration ? (
                <div className={`route-date-editor-duration-pill ${durationInfo?.isTooShort ? 'route-date-editor-duration-pill-error' : ''}`}>
                    {durationInfo?.isTooShort && (
                        <AlertTriangle size={14} className="route-date-editor-duration-icon-error" />
                    )}
                    <span>{duration}</span>
                    {durationInfo?.isTooShort && (
                        <span className="route-date-editor-duration-min-label">
                            (min. {durationInfo.minDays} {durationInfo.minDays === 1 ? 'den' : 'dny'})
                        </span>
                    )}
                </div>
            ) : (
                <div className="route-date-editor-duration-pill route-date-editor-duration-pill-placeholder">
                    <span>—</span>
                </div>
            )}
        </div>
    );

    {/* --- END: AI-GENERATED UI --- */}
};

export default DurationPill;
