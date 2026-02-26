import { WizardStep, type WizardStepType } from "../types/wizard";

export const STEP_URLS: Record<WizardStepType, string> = {
    [WizardStep.LOCATION]: "location",
    [WizardStep.DATE]: "dates",
    [WizardStep.USERS]: "users",
    [WizardStep.EQUIPMENT]: "equipment",
    [WizardStep.CONFIG]: "configuration",
    [WizardStep.FINISH]: "summary",
    [WizardStep.INIT]: ""
};

export const URL_TO_STEP = Object.entries(STEP_URLS).reduce((acc, [step, url]) => {
    if (url) acc[url] = Number(step);
    return acc;
}, {} as Record<string, number>);

export const getStepFromUrl = (stepUrl?: string): WizardStepType => {
    return stepUrl ? (URL_TO_STEP[stepUrl] as WizardStepType) ?? WizardStep.INIT : WizardStep.INIT;
};
