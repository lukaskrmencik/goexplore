import React from 'react';
import { WizardStep } from "../../../types/wizard";
import { Check } from "lucide-react";
import './WizardStepper.css';

interface WizardStepperProps {
    currentStep: number;
    mode?: string;
    onStepClick?: (stepId: number) => void;
}

const steps = [
    { id: WizardStep.LOCATION, label: 'Mapa' },
    { id: WizardStep.DATE, label: 'Kdy na datum' },
    { id: WizardStep.USERS, label: 'Lidé' },
    { id: WizardStep.EQUIPMENT, label: 'Výbava' },
    { id: WizardStep.CONFIG, label: 'Nastavení' },
];

export const WizardStepper: React.FC<WizardStepperProps> = ({ currentStep, mode, onStepClick }) => {
    const visibleSteps = steps.filter(step => {
        if (mode === 'simple' && step.id === WizardStep.CONFIG) return false;
        return true;
    });

    const handleStepClick = (stepId: number) => {
        // Only allow clicking on completed (green) steps
        if (currentStep > stepId && onStepClick) {
            onStepClick(stepId);
        }
    };

    return (
        <div className="stepper-container">
            {/* Desktop Stepper */}
            <div className="stepper-desktop">
                {visibleSteps.map((step, index) => {
                    const isCompleted = currentStep > step.id;
                    const isCurrent = currentStep === step.id;
                    const clickable = isCompleted && !!onStepClick;

                    return (
                        <div key={step.id} className="stepper-item-wrapper">
                            <div
                                className={`stepper-item ${isCurrent ? 'stepper-item-current' : isCompleted ? 'stepper-item-completed' : 'stepper-item-pending'} ${clickable ? 'stepper-item-clickable' : ''}`}
                                onClick={() => handleStepClick(step.id)}
                                role={clickable ? 'button' : undefined}
                                tabIndex={clickable ? 0 : undefined}
                            >
                                <div className={`stepper-circle ${isCompleted ? 'stepper-circle-completed' : isCurrent ? 'stepper-circle-current' : 'stepper-circle-pending'}`}>
                                    {isCompleted ? <Check size={12} strokeWidth={3} /> : (index + 1)}
                                </div>
                                <span className={`stepper-label ${isCurrent ? 'stepper-label-current' : isCompleted ? 'stepper-label-completed' : 'stepper-label-pending'}`}>
                                    {step.label}
                                </span>
                            </div>

                            {index < visibleSteps.length - 1 && (
                                <div className={`stepper-connector ${isCompleted ? 'stepper-connector-completed' : 'stepper-connector-pending'}`} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Mobile Stepper */}
            <div className="stepper-mobile">
                <div className="stepper-mobile-flex">
                    {visibleSteps.map((step, index) => {
                        const isCompleted = currentStep > step.id;
                        const isCurrent = currentStep === step.id;
                        const clickable = isCompleted && !!onStepClick;

                        return (
                            <div key={step.id} className="stepper-item-wrapper">
                                <div
                                    className={`stepper-mobile-item ${isCurrent ? 'stepper-item-current' : isCompleted ? 'stepper-item-completed' : 'stepper-item-pending'} ${clickable ? 'stepper-item-clickable' : ''}`}
                                    onClick={() => handleStepClick(step.id)}
                                    role={clickable ? 'button' : undefined}
                                    tabIndex={clickable ? 0 : undefined}
                                >
                                    <div className={`stepper-mobile-circle ${isCompleted ? 'stepper-circle-completed' : isCurrent ? 'stepper-circle-current' : 'stepper-circle-pending'}`}>
                                        {isCompleted ? <Check size={10} strokeWidth={3} /> : (index + 1)}
                                    </div>
                                    <span className={`stepper-mobile-label ${isCurrent ? 'stepper-mobile-label-visible stepper-label-current' : 'stepper-mobile-label-hidden stepper-label-completed'}`}>
                                        {step.label}
                                    </span>
                                </div>

                                {index < visibleSteps.length - 1 && (
                                    <div className={`stepper-mobile-connector ${isCompleted ? 'stepper-connector-completed' : 'stepper-connector-pending'}`} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
