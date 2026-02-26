import type { Point } from "geojson";

export interface User {
  id: number;
  name: string;
  email: string;
  profile_picture: string | null;
  role: string;
  location: Point | null;
  created_at: string;
  updated_at: string;
}

export interface RouteUser extends User {
  pivot: {
    routes_id: number;
    users_id: number;
    created_at: string;
    updated_at: string;
  };
}