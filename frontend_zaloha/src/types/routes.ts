import type { LineString, Point } from "geojson";
import type { User, RouteUser } from "./users";

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

  general_equipment?: any; // GeneralEquipment (Circular dep if imported?)
  my_equipment?: any;      // MyEquipment

  // Joins/Appends might provide these directly flattened or nested?
  // Frontend code uses item.name directly, implying flattened or eager loaded with accessor?
  // Actually, looking at RouteUsersEditor, it constructs objects. 
  // Let's assume the backend 'Route' model 'equipment' relation returns the *Equipment* objects with pivot info, OR the RouteEquipment pivot objects with Equipment info.
  // Controller 'addEquipment' returns RouteEquipment pivot.
  // Frontend code in RouteEquipmentEditor expects: item.name, item.general_equipment_id, item.my_equipment_id. 
  // This suggests the array contains objects that have both pivot data AND equipment data mixed, or it's the pivot object with 'general_equipment'/'my_equipment' relation loaded.
  // Given "item.name", let's include loose typing for now to satisfy the build, or correct fields.
  name?: string;
  img?: string;
  specifications?: any;
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
  users?: RouteUser[];
  user?: User; // Owner for shared routes
  [key: string]: any;
}

export interface RoutesListResponse {
  page: number;
  per_page: number;
  total_pages: number;
  total_items: number;
  items: RouteItem[];
}