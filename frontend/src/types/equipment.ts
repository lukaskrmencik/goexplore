export type EquipmentType = 'general' | 'my';

export interface GeneralEquipment {
  id: number;
  name: string;
  img: string | null;
  specifications_keys?: Record<string, string>;
  general_specifications: Record<string, any>;
  created_at: string | null;
  updated_at: string | null;
}

export interface MyEquipment {
  id: number;
  users_id: number;
  name: string;
  img: string | null;
  specifications: string; 
  general_equipment_id: number;
  created_at: string;
  updated_at: string;
}