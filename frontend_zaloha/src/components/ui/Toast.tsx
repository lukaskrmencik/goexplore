import React, { useEffect } from "react";
import { X, AlertCircle, CheckCircle } from "lucide-react";

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

    const bgClass = type === "error" ? "bg-rose-600" : "bg-emerald-600";
    const icon = type === "error" ? <AlertCircle className="shrink-0" size={20} /> : <CheckCircle className="shrink-0" size={20} />;

    return (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-md animate-in fade-in slide-in-from-top-4 duration-300">
            <div className={`${bgClass} text-white px-4 py-3 rounded-xl shadow-xl shadow-black/10 flex items-center gap-3`}>
                {icon}
                <p className="flex-1 text-sm font-bold font-heading">{message}</p>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
};

export default Toast;
