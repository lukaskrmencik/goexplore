import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

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
        <div className="space-y-1.5 w-full">
            {label && (
                <label className={`block text-sm font-bold ${error ? 'text-rose-600' : 'text-slate-700'}`}>
                    {label}
                </label>
            )}

            <div className="relative">
                {Icon && (
                    <Icon className={`absolute left-4 top-3.5 ${error ? 'text-rose-400' : 'text-slate-400'}`} size={20} />
                )}

                <input
                    className={`
            w-full py-3 bg-white border rounded-xl outline-none transition-all font-medium shadow-sm
            ${Icon ? 'pl-11' : 'px-4'}
            ${error ? 'pr-10 border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 text-rose-600' : 'pr-4 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-slate-900 placeholder:text-slate-400'}
            ${className}
          `}
                    {...props}
                />

                {error && (
                    <AlertCircle className="absolute right-4 top-3.5 text-rose-500" size={20} />
                )}
            </div>

            {error && (
                <p className="text-sm text-rose-600 font-medium flex items-center gap-1">
                    {error}
                </p>
            )}
        </div>
    );
};
