import React from 'react';
import type { LucideIcon } from 'lucide-react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    icon?: LucideIcon;
    rightIcon?: LucideIcon;
    isLoading?: boolean;
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    icon: Icon,
    rightIcon: RightIcon,
    isLoading = false,
    children,
    className = '',
    ...props
}) => {
    return (
        <button
            className={`btn btn-${variant} btn-${size} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <div className="spinner" />
            ) : (
                Icon && <Icon size={size === 'sm' ? 16 : 20} />
            )}
            <span>{children}</span>
            {!isLoading && RightIcon && <RightIcon size={size === 'sm' ? 16 : 20} />}
        </button>
    );
};
