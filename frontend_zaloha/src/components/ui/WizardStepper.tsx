import React from 'react';
import { WizardStep } from "../../types/wizard";
import { Check } from "lucide-react";

interface WizardStepperProps {
    currentStep: number;
    mode?: string;
}

const steps = [
    { id: WizardStep.LOCATION, label: 'Mapa' },
    { id: WizardStep.DATE, label: 'Kdy' },
    { id: WizardStep.USERS, label: 'Lidé' },
    { id: WizardStep.EQUIPMENT, label: 'Výbava' },
    { id: WizardStep.CONFIG, label: 'Nastavení' },
];

export const WizardStepper: React.FC<WizardStepperProps> = ({ currentStep, mode }) => {
    // Filter steps based on mode
    const visibleSteps = steps.filter(step => {
        if (mode === 'simple' && step.id === WizardStep.CONFIG) return false;
        return true;
    });

    return (
        <div className="w-full flex items-center justify-center">
            {/* Desktop Stepper */}
            <div className="hidden md:flex items-center gap-2">
                {visibleSteps.map((step, index) => {
                    const isCompleted = currentStep > step.id;
                    const isCurrent = currentStep === step.id;

                    return (
                        <div key={step.id} className="flex items-center">
                            {/* Step Item */}
                            <div className={`
                                flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300
                                ${isCurrent
                                    ? 'bg-emerald-50 border-emerald-200 shadow-sm'
                                    : isCompleted
                                        ? 'bg-white border-transparent'
                                        : 'bg-white border-transparent opacity-50'}
                            `}>
                                <div className={`
                                    w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border
                                    ${isCompleted
                                        ? 'bg-emerald-500 border-emerald-500 text-white'
                                        : isCurrent
                                            ? 'bg-white border-emerald-500 text-emerald-600'
                                            : 'bg-slate-100 border-slate-200 text-slate-400'}
                                `}>
                                    {isCompleted ? <Check size={12} strokeWidth={3} /> : (index + 1)}
                                </div>
                                <span className={`
                                    text-xs font-bold uppercase tracking-wide
                                    ${isCurrent ? 'text-emerald-800' : isCompleted ? 'text-slate-600' : 'text-slate-400'}
                                `}>
                                    {step.label}
                                </span>
                            </div>

                            {/* Connector Line */}
                            {index < visibleSteps.length - 1 && (
                                <div className={`w-6 h-0.5 rounded-full mx-1 ${isCompleted ? 'bg-emerald-200' : 'bg-slate-100'}`} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Mobile Stepper - Desktop Style (Compact for Mobile) */}
            <div className="md:hidden w-full flex justify-center pb-1">
                <div className="flex items-center gap-1">
                    {visibleSteps.map((step, index) => {
                        const isCompleted = currentStep > step.id;
                        const isCurrent = currentStep === step.id;

                        return (
                            <div key={step.id} className="flex items-center">
                                {/* Step Item */}
                                <div className={`
                                    flex items-center gap-1.5 px-2 py-1 rounded-full border transition-all duration-300
                                    ${isCurrent
                                        ? 'bg-emerald-50 border-emerald-200 shadow-sm'
                                        : isCompleted
                                            ? 'bg-white border-transparent'
                                            : 'bg-white border-transparent opacity-50'}
                                `}>
                                    <div className={`
                                        w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border
                                        ${isCompleted
                                            ? 'bg-emerald-500 border-emerald-500 text-white'
                                            : isCurrent
                                                ? 'bg-white border-emerald-500 text-emerald-600'
                                                : 'bg-slate-100 border-slate-200 text-slate-400'}
                                    `}>
                                        {isCompleted ? <Check size={10} strokeWidth={3} /> : (index + 1)}
                                    </div>
                                    {/* Show label only for current or completed (or if space allows - trying to fit all 5 is hard) */}
                                    {/* COMPACT MODE: Only show label if active, otherwise hidden on smallest screens */}
                                    <span className={`
                                        text-[10px] font-bold uppercase tracking-wide whitespace-nowrap
                                        ${isCurrent ? 'block text-emerald-800' : 'hidden sm:block text-slate-600'}
                                    `}>
                                        {step.label}
                                    </span>
                                </div>

                                {/* Connector Line (Tiny) */}
                                {index < visibleSteps.length - 1 && (
                                    <div className={`w-1 h-0.5 rounded-full ${isCompleted ? 'bg-emerald-200' : 'bg-slate-100'}`} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
