import React, { useEffect } from "react";
import { X, AlertCircle, CheckCircle } from "lucide-react";
import './Toast.css';

interface ToastProps {
    message: string | null;
    type?: "error" | "success";
    onClose: () => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type = "error", onClose, duration = 4000 }) => {
    useEffect(() => {
        if (!message) return;

        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [message, duration, onClose]);

    if (!message) return null;

    const bgClass = type === "error" ? "toast-error" : "toast-success";
    const icon = type === "error" ? <AlertCircle className="toast-icon" size={20} /> : <CheckCircle className="toast-icon" size={20} />;

    return (
        <div className="toast-container">
            <div className={`toast-content ${bgClass}`}>
                {icon}
                <p className="toast-message">{message}</p>
                <button
                    onClick={onClose}
                    className="toast-close-btn"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
};

export default Toast;
