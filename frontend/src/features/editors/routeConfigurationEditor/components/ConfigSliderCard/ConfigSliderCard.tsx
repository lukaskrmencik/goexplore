import React from "react";
import './ConfigSliderCard.css';

interface ConfigSliderCardProps {
    icon: React.ReactNode;
    title: string;
    description: React.ReactNode;
    value: number;
    min: number;
    max: number;
    step: number;
    unit?: string;
    onChange?: (value: number) => void;
    disabled?: boolean;
}

const ConfigSliderCard: React.FC<ConfigSliderCardProps> = ({
    icon,
    title,
    description,
    value,
    min,
    max,
    step,
    unit,
    onChange,
    disabled = false,
}) => {

    {/* --- START: AI-GENERATED UI (Claude 3.7 Sonnet Thinking) --- */}
    {/* Layout and structure generated from design. Data binding and variables added manually. */}

    return (
        <div className={`route-config-editor-card${disabled ? ' route-config-editor-card-disabled' : ''}`}>
            <div className="route-config-editor-card-header">
                <div className="route-config-editor-card-title-group">
                    <div className="route-config-editor-card-icon-wrapper">{icon}</div>
                    <span className="route-config-editor-card-title">{title}</span>
                </div>
                <span className="route-config-editor-card-value">
                    {value}
                    {unit && <span className="route-config-editor-card-value-unit"> {unit}</span>}
                </span>
            </div>

            <p className="route-config-editor-card-desc">{description}</p>

            <div className="route-config-editor-controls">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    disabled={disabled}
                    onChange={(e) => onChange?.(Number(e.target.value))}
                    className="route-config-editor-range-input"
                />
                <div className="route-config-editor-range-labels">
                    <span>{min}{unit ? ` ${unit}` : ''}</span>
                    <span>{max}{unit ? ` ${unit}` : ''}</span>
                </div>
            </div>
        </div>
    );

    {/* --- END: AI-GENERATED UI --- */}
};

export default ConfigSliderCard;
