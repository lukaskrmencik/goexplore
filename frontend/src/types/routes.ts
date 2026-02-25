import type { LineString, Point } from "geojson";
import type { User, RouteUser } from "./users";
import type { GeneralEquipment, MyEquipment } from "./equipment";

export type RouteMode = 'simple' | 'manual';

export interface Route {
  id: number;
  users_id: number;
  name: string;
  mode: RouteMode;

  start_date?: string;
  end_date?: string;

  buffer_size?: number;
  max_route_length_day?: number;
  poi_per_day?: number;

  start?: Point;
  end?: Point;
  axis?: LineString;
  complete_route?: LineString;

  camps: RouteCamp[];
  poi: RoutePoiWrapper[];

  equipment?: RouteEquipment[];
  waypoints: RouteWaypoint[];
  users: RouteUser[];
  user?: User;

  created_at: string;
  updated_at: string;
}

export interface RoutePoiWrapper {
  type: string
  cluster?: RouteCluster
  poi_data: RoutePoi[]
  order: number
}

export interface RouteCluster {
  id: number
  name: string
  location: Point
  best_poi_id: number
}

export interface RoutePoi {
  id: number
  name: string
  image_url?: string
  location: Point
}

export interface RouteCamp {
  id: number
  name: string
  image_url?: string
  location: Point
  order: number
}

export interface RouteEquipment {
  id: number; // Pivot ID
  routes_id: number;
  general_equipment_id?: number;
  my_equipment_id?: number;

  general_equipment?: GeneralEquipment;
  my_equipment?: MyEquipment;

  name?: string;
  img?: string;
  specifications?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface RouteWaypoint {
  id: number
  routes_id: number
  coordinates: Point
  order: number
  created_at: string;
  updated_at: string;
}

export interface RouteItem {
  id: number;
  name: string;
  mode: string;
  start_date?: string;
  end_date?: string;
  length_meters?: number;
  simplified_geojson?: string;
  users?: RouteUser[];
  user?: User;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface RoutesListResponse {
  page: number;
  per_page: number;
  total_pages: number;
  total_items: number;
  items: RouteItem[];
}

export interface InviteDetails {
  inviter_name: string;
  route_name: string;
  route_id: number;
  is_owner: boolean;
  is_member: boolean;
}

export interface RouteLengthConstraints {
    minKmPerDay: number;
    maxKmPerDay: number;
    minDays: number;
}

export interface SeasonConstraints {
    startMonth: number;
    endMonth: number;
}

export interface PaceInfo {
    tripDays: number;
    kmPerDay: number;
    minKmPerDay: number;
    maxKmPerDay: number;
    isUnderMin: boolean;
    isOverMax: boolean;
    isValid: boolean;
}

export interface CalculationProgressData {
    progress: number;
    status: string;
    state: string;
    error?: string;
}