import type { Route } from "./routes";

export interface EditorPoint {
    id: string;
    dbId?: number;
    lat: number;
    lng: number;
    type: 'start' | 'end' | 'waypoint';
    name?: string;
    order: number;
}

export interface RouteAxisEditorHandle {
    save: () => Promise<void>;
}

export interface RouteDateEditorHandle {
    save: () => Promise<void>;
}

export interface RouteConfigurationEditorHandle {
    save: () => Promise<void>;
}

export interface RouteEditorProps {
    route: Route;
    onUpdate: (route: Route) => void;
    onChange?: () => void;
}
