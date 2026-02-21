import React from 'react';
import './Card.css';

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
            className={`card ${hoverEffect || onClick ? 'card-interactive' : ''} ${className}`}
        >
            {children}
        </div>
    );
};
