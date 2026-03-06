import type { EditorPoint } from "../types/editor";
import type { Route, RouteLengthConstraints, SeasonConstraints } from "../types/routes";
import { geojsonPointToLatLng } from "./geo";

export type { RouteLengthConstraints, SeasonConstraints };

const DAILY_LIMIT_COEFFICIENT = Number(import.meta.env.VITE_CONFIG_DAILY_LIMIT_COEFFICIENT ?? "1.2");


export function computeDailyLimitFromRoute(route: Route, estimatedRoadKm: number): number | null {
    if (!route.start_date || !route.end_date || estimatedRoadKm <= 0) return null;

    const start = new Date(route.start_date).getTime();
    const end = new Date(route.end_date).getTime();
    const diffMs = end - start;
    const numberOfDays = diffMs / (1000 * 60 * 60 * 24);

    if (numberOfDays <= 0) return null;

    const kmPerDay = estimatedRoadKm / numberOfDays;
    return Math.round(kmPerDay * DAILY_LIMIT_COEFFICIENT);
}

export function computeRouteEstimatedKm(route: Route): number {
    const points: EditorPoint[] = [];

    if (route.start) {
        const [lat, lng] = geojsonPointToLatLng(route.start) as [number, number];
        points.push({ id: 'start', lat, lng, type: 'start', name: 'Start', order: 0 });
    }

    if (route.waypoints?.length) {
        [...route.waypoints]
            .sort((a, b) => a.order - b.order)
            .forEach(wp => {
                const [lat, lng] = geojsonPointToLatLng(wp.coordinates) as [number, number];
                points.push({ id: `wp-${wp.id}`, lat, lng, type: 'waypoint', name: '', order: wp.order });
            });
    }

    if (route.end) {
        const [lat, lng] = geojsonPointToLatLng(route.end) as [number, number];
        points.push({ id: 'end', lat, lng, type: 'end', name: 'End', order: 9999 });
    }

    return points.length >= 2 ? computeEstimatedLength(points).roadKm : 0;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

export function calculateAxisLengthKm(points: EditorPoint[]): number {
    if (points.length < 2) return 0;

    let total = 0;

    for (let i = 0; i < points.length - 1; i++) {
        total += haversineKm(points[i].lat, points[i].lng, points[i + 1].lat, points[i + 1].lng);
    }

    return total;
}

export function estimateRoadLengthKm(axisKm: number): number {
    const factor = parseFloat(import.meta.env.VITE_ROUTE_ROAD_FACTOR ?? "1.35");
    return axisKm * factor;
}

export function getRouteLengthConstraints(): RouteLengthConstraints {
    return {
        minKmPerDay: parseFloat(import.meta.env.VITE_ROUTE_MIN_KM_PER_DAY ?? "40"),
        maxKmPerDay: parseFloat(import.meta.env.VITE_ROUTE_MAX_KM_PER_DAY ?? "1000"),
        minDays: parseFloat(import.meta.env.VITE_ROUTE_MIN_DAYS ?? "1.5"),
    };
}

export function computeEstimatedLength(points: EditorPoint[]): { axisKm: number; roadKm: number } {
    const axisKm = calculateAxisLengthKm(points);
    const roadKm = estimateRoadLengthKm(axisKm);

    return { axisKm, roadKm };
}

export function getSeasonConstraints(): SeasonConstraints {
    return {
        startMonth: parseInt(import.meta.env.VITE_SEASON_START_MONTH ?? "5", 10),
        endMonth: parseInt(import.meta.env.VITE_SEASON_END_MONTH ?? "9", 10),
    };
}

export function isInSeason(date: Date): boolean {
    const { startMonth, endMonth } = getSeasonConstraints();
    const month = date.getMonth() + 1;

    return month >= startMonth && month <= endMonth;
}
