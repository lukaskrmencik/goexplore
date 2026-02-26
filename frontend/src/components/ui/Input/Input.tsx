import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: LucideIcon;
    error?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    icon: Icon,
    error,
    className = '',
    ...props
}) => {
    return (
        <div className="input-wrapper">
            {label && (
                <label className={`input-label ${error ? 'input-label-error' : 'input-label-standard'}`}>
                    {label}
                </label>
            )}

            <div className="input-container">
                {Icon && (
                    <Icon className={`input-icon-left ${error ? 'input-icon-left-error' : 'input-icon-left-standard'}`} size={20} />
                )}

                <input
                    className={`
            input-field
            ${Icon ? 'input-field-with-icon' : 'input-field-without-icon'}
            ${error ? 'input-field-error' : 'input-field-standard'}
            ${className}
          `}
                    {...props}
                />

                {error && (
                    <AlertCircle className="input-icon-right" size={20} />
                )}
            </div>

            {error && (
                <p className="input-error-message">
                    {error}
                </p>
            )}
        </div>
    );
};
