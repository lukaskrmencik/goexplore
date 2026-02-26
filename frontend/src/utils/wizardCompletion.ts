import type { Route } from "../types/routes";
import { WizardStep, type WizardStepType } from "../types/wizard";

export const getCompletedSteps = (route: Route | null, mode?: string): Set<number> => {
    const completed = new Set<number>();
    if (!route) return completed;

    if (route.start && route.end) {
        completed.add(WizardStep.LOCATION);
    }

    if (route.start_date && route.end_date) {
        completed.add(WizardStep.DATE);
    }

    if (route.users && route.users.length > 0) {
        completed.add(WizardStep.USERS);
    }

    if (route.equipment && route.equipment.length > 0) {
        completed.add(WizardStep.EQUIPMENT);
    }

    const routeMode = mode || route.mode;
    if (routeMode === "manual" && route.buffer_size) {
        completed.add(WizardStep.CONFIG);
    }

    return completed;
};

export const getFirstIncompleteStep = (route: Route | null, mode?: string): number => {
    const completed = getCompletedSteps(route, mode);
    const routeMode = mode || route?.mode;

    const stepOrder: WizardStepType[] = routeMode === "simple"
        ? [WizardStep.LOCATION, WizardStep.DATE, WizardStep.USERS]
        : [WizardStep.LOCATION, WizardStep.DATE, WizardStep.USERS, WizardStep.EQUIPMENT, WizardStep.CONFIG];

    for (const step of stepOrder) {
        if (!completed.has(step)) {
            return step;
        }
    }

    return routeMode === "simple" ? WizardStep.USERS : WizardStep.FINISH;
};
