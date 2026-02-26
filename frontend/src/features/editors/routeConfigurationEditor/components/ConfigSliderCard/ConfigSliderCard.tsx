import React from "react";
import './ConfigSliderCard.css';

interface ConfigSliderCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    value: number;
    min: number;
    max: number;
    step: number;
    unit?: string;
    onChange: (value: number) => void;
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
}) => {
    return (
        <div className="route-config-editor-card">
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
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="route-config-editor-range-input"
                />
                <div className="route-config-editor-range-labels">
                    <span>{min}{unit ? ` ${unit}` : ''}</span>
                    <span>{max}{unit ? ` ${unit}` : ''}</span>
                </div>
            </div>
        </div>
    );
};

export default ConfigSliderCard;
