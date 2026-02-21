import React from 'react';
import type { LucideIcon } from 'lucide-react';

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
    const baseStyles = "font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20",
        secondary: "bg-white border border-slate-200 hover:bg-slate-50 text-slate-700",
        destructive: "bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100",
        ghost: "bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-6 py-3 text-sm",
        lg: "px-8 py-4 text-base",
        icon: "p-2"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
            ) : (
                Icon && <Icon size={size === 'sm' ? 16 : 20} />
            )}
            <span>{children}</span>
            {!isLoading && RightIcon && <RightIcon size={size === 'sm' ? 16 : 20} />}
        </button>
    );
};
