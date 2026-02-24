import React from "react";
import "./Spinner.css";

interface SpinnerProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = "md", className = "" }) => {
    return (
        <div
            className={`spinner spinner-${size} ${className}`.trim()}
            role="status"
            aria-label="Načítání"
        />
    );
};

export default Spinner;
