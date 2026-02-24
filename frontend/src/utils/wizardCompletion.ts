import type { Route } from "../types/routes";
import { WizardStep, type WizardStepType } from "../types/wizard";

/**
 * Determine which wizard steps are already completed based on route data from the DB.
 */
export const getCompletedSteps = (route: Route | null, mode?: string): Set<number> => {
    const completed = new Set<number>();
    if (!route) return completed;

    // LOCATION: completed if start AND end points are set
    if (route.start && route.end) {
        completed.add(WizardStep.LOCATION);
    }

    // DATE: completed if start_date AND end_date are set
    if (route.start_date && route.end_date) {
        completed.add(WizardStep.DATE);
    }

    // USERS: completed only if at least one additional user is assigned
    if (route.users && route.users.length > 0) {
        completed.add(WizardStep.USERS);
    }

    // EQUIPMENT: completed only if some equipment is attached
    if (route.equipment && route.equipment.length > 0) {
        completed.add(WizardStep.EQUIPMENT);
    }

    // CONFIG: completed only in manual mode when buffer_size is set
    const routeMode = mode || route.mode;
    if (routeMode === "manual" && route.buffer_size) {
        completed.add(WizardStep.CONFIG);
    }

    return completed;
};

/**
 * Get the first incomplete wizard step for resume functionality.
 * Returns the step ID where the user should continue.
 */
export const getFirstIncompleteStep = (route: Route | null, mode?: string): number => {
    const completed = getCompletedSteps(route, mode);
    const routeMode = mode || route?.mode;

    let stepOrder: WizardStepType[];

    // For simple mode we only ever auto-resume up to the crew step.
    // For manual mode we keep the full flow including equipment + config.
    if (routeMode === "simple") {
        stepOrder = [WizardStep.LOCATION, WizardStep.DATE, WizardStep.USERS];
    } else {
        stepOrder = [WizardStep.LOCATION, WizardStep.DATE, WizardStep.USERS, WizardStep.EQUIPMENT, WizardStep.CONFIG];
    }

    for (const step of stepOrder) {
        if (!completed.has(step)) {
            return step;
        }
    }

    // All steps in the ordered flow are completed.
    // Simple mode: never auto-jump past the crew step – stay on USERS.
    // Manual mode: go to FINISH as before.
    return routeMode === "simple" ? WizardStep.USERS : WizardStep.FINISH;
};
