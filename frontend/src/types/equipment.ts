export type EquipmentType = 'general' | 'my';

import type { User } from './users';

export interface GeneralEquipment {
    id: number;
    name: string;
    img: string | null;
    specifications_keys?: Record<string, string>;
    general_specifications: Record<string, unknown>;
    created_at: string | null;
    updated_at: string | null;
}

export interface MyEquipment {
    id: number;
    users_id: number;
    name: string;
    img: string | null;
    specifications: Record<string, unknown>;
    general_equipment_id: number;
    created_at: string;
    updated_at: string;
    general_equipment?: GeneralEquipment;
    user?: User;
}