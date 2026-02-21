export const WizardStep = {
    INIT: 0,
    LOCATION: 1,
    DATE: 2,
    USERS: 3,
    EQUIPMENT: 4,
    CONFIG: 5,
    FINISH: 6
} as const;

export type WizardStepType = typeof WizardStep[keyof typeof WizardStep];

