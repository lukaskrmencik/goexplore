import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    onClick,
    hoverEffect = false
}) => {
    return (
        <div
            onClick={onClick}
            className={`
        bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden
        ${hoverEffect || onClick ? 'hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer' : ''}
        ${className}
      `}
        >
            {children}
        </div>
    );
};
