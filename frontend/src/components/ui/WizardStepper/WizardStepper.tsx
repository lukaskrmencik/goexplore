import React from 'react';
import { WizardStep } from "../../../types/wizard";
import { Check } from "lucide-react";
import './WizardStepper.css';

interface WizardStepperProps {
    currentStep: number;
    mode?: string;
    onStepClick?: (stepId: number) => void;
}

interface StepDefinition {
    id: number;
    label: string;
}

interface StepState {
    isCompleted: boolean;
    isCurrent: boolean;
    isClickable: boolean;
}

const STEP_DEFINITIONS: StepDefinition[] = [
    { id: WizardStep.LOCATION, label: 'Trasa' },
    { id: WizardStep.DATE, label: 'Datum' },
    { id: WizardStep.USERS, label: 'Lidé' },
    { id: WizardStep.EQUIPMENT, label: 'Výbava' },
    { id: WizardStep.CONFIG, label: 'Nastavení' },
];

function resolveStepState(stepId: number, currentStep: number, hasClickHandler: boolean): StepState {
    const isCompleted = currentStep > stepId;
    const isCurrent = currentStep === stepId;
    const isClickable = isCompleted && hasClickHandler;
    return { isCompleted, isCurrent, isClickable };
}

export const WizardStepper: React.FC<WizardStepperProps> = ({ currentStep, mode, onStepClick }) => {
    const visibleSteps = STEP_DEFINITIONS.filter(step => {
        if (mode === 'simple' && step.id === WizardStep.CONFIG) return false;
        return true;
    });

    const handleStepClick = (stepId: number) => {
        if (currentStep > stepId && onStepClick) {
            onStepClick(stepId);
        }
    };

    return (
        <div className="stepper-container">
            <div className="stepper-desktop">
                {visibleSteps.map((step, index) => {
                    const { isCompleted, isCurrent, isClickable } = resolveStepState(step.id, currentStep, !!onStepClick);

                    return (
                        <div key={step.id} className="stepper-item-wrapper">
                            <div
                                className={`stepper-item ${isCurrent ? 'stepper-item-current' : isCompleted ? 'stepper-item-completed' : 'stepper-item-pending'} ${isClickable ? 'stepper-item-clickable' : ''}`}
                                onClick={() => handleStepClick(step.id)}
                                role={isClickable ? 'button' : undefined}
                                tabIndex={isClickable ? 0 : undefined}
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

            <div className="stepper-mobile">
                <div className="stepper-mobile-flex">
                    {visibleSteps.map((step, index) => {
                        const { isCompleted, isCurrent, isClickable } = resolveStepState(step.id, currentStep, !!onStepClick);

                        return (
                            <div key={step.id} className="stepper-item-wrapper">
                                <div
                                    className={`stepper-mobile-item ${isCurrent ? 'stepper-item-current' : isCompleted ? 'stepper-item-completed' : 'stepper-item-pending'} ${isClickable ? 'stepper-item-clickable' : ''}`}
                                    onClick={() => handleStepClick(step.id)}
                                    role={isClickable ? 'button' : undefined}
                                    tabIndex={isClickable ? 0 : undefined}
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
