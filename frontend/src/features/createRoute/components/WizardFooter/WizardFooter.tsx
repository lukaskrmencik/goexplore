import React from "react";
import { ChevronRight, ChevronLeft, Save, Trash2, Play } from "lucide-react";
import './WizardFooter.css';
import { WizardStep } from "../../../../types/wizard";
import type { WizardStepType } from "../../../../types/wizard";
import { Button } from "../../../../components/ui/Button/Button";

interface WizardFooterProps {
    currentStep: WizardStepType;
    isFirstStep: boolean;
    isLastStep: boolean;
    isStepSaving: boolean;
    onPrevStep: () => void;
    onNextStep: () => void;
    onGenerate: () => void;
}

const WizardFooter: React.FC<WizardFooterProps> = ({
    currentStep,
    isFirstStep,
    isLastStep,
    isStepSaving,
    onPrevStep,
    onNextStep,
    onGenerate,
}) => {
    const rightButtonLabel = isStepSaving ? "Ukládám..." : isLastStep ? "Generovat" : currentStep === WizardStep.CONFIG ? "Dokončit" : "Pokračovat";

    const rightButtonIcon = isStepSaving ? undefined : isLastStep ? Play : currentStep === WizardStep.CONFIG ? Save : ChevronRight;

    {/* --- START: AI-GENERATED UI (Gemini 3.1 Pro) --- */}
    {/* Layout and structure generated from design. Data binding and variables added manually. */}

    return (
        <div className="create-route-footer">
            <div className="create-route-footer-inner">
                <Button
                    variant={isFirstStep ? "destructive" : "ghost"}
                    onClick={onPrevStep}
                    icon={isFirstStep ? Trash2 : ChevronLeft}
                    size="md"
                    className={isFirstStep ? "create-route-btn-delete" : "create-route-btn-back"}
                >
                    {isFirstStep ? "Smazat" : "Zpět"}
                </Button>

                <Button
                    onClick={isLastStep ? onGenerate : onNextStep}
                    disabled={isStepSaving}
                    variant="primary"
                    rightIcon={rightButtonIcon}
                    size="md"
                    className="create-route-btn-next"
                >
                    {rightButtonLabel}
                </Button>
            </div>
        </div>
    );

    {/* --- END: AI-GENERATED UI --- */}
};

export default WizardFooter;
