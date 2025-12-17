import type { LineString, Point } from "geojson";

export interface Route {
	id: number;
	users_id: number;
	name: string;
	mode: string;
	
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

	generalEquipment: RouteEquipment[]; 
	myEquipment: RouteEquipment[];
	waypoints: any[];

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
	id: number
	name: string
	img?: string
	specifications: any
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
  [key: string]: any;
}

export interface RoutesListResponse {
  page: number;
  per_page: number;
  total_pages: number;
  total_items: number;
  items: RouteItem[];
}
