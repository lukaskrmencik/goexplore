import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'primary' | 'accent' | 'neutral' | 'outline';
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'primary',
    className = ''
}) => {
    const variants = {
        primary: "bg-emerald-100 text-emerald-800",
        accent: "bg-amber-100 text-amber-800",
        neutral: "bg-slate-100 text-slate-700",
        outline: "bg-transparent border border-slate-200 text-slate-600"
    };

    return (
        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};
