import type { EditorPoint } from "../types/editor";
import type { RouteLengthConstraints, SeasonConstraints } from "../types/routes";

export type { RouteLengthConstraints, SeasonConstraints };

/**
 * Returns the great-circle distance (km) between two lat/lng points
 * using the Haversine formula.
 */
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

/**
 * Computes the total straight-line (axis) length in km
 * by summing haversine distances between consecutive points.
 */
export function calculateAxisLengthKm(points: EditorPoint[]): number {
    if (points.length < 2) return 0;
    let total = 0;
    for (let i = 0; i < points.length - 1; i++) {
        total += haversineKm(points[i].lat, points[i].lng, points[i + 1].lat, points[i + 1].lng);
    }
    return total;
}

/**
 * Multiplies the axis length by the road factor constant from env
 * to get an estimated on-road length in km.
 */
export function estimateRoadLengthKm(axisKm: number): number {
    const factor = parseFloat(import.meta.env.VITE_ROUTE_ROAD_FACTOR ?? "1.35");
    return axisKm * factor;
}

/**
 * Returns the min/max km-per-day and minimum trip days from env.
 */
export function getRouteLengthConstraints(): RouteLengthConstraints {
    return {
        minKmPerDay: parseFloat(import.meta.env.VITE_ROUTE_MIN_KM_PER_DAY ?? "40"),
        maxKmPerDay: parseFloat(import.meta.env.VITE_ROUTE_MAX_KM_PER_DAY ?? "1000"),
        minDays: parseFloat(import.meta.env.VITE_ROUTE_MIN_DAYS ?? "1.5"),
    };
}

/**
 * Computes both axis and estimated road length from a set of editor points.
 * Returns 0 for both if there are fewer than 2 points.
 */
export function computeEstimatedLength(points: EditorPoint[]): { axisKm: number; roadKm: number } {
    const axisKm = calculateAxisLengthKm(points);
    const roadKm = estimateRoadLengthKm(axisKm);
    return { axisKm, roadKm };
}

/**
 * Returns the allowed season months from env.
 */
export function getSeasonConstraints(): SeasonConstraints {
    return {
        startMonth: parseInt(import.meta.env.VITE_SEASON_START_MONTH ?? "5", 10),
        endMonth: parseInt(import.meta.env.VITE_SEASON_END_MONTH ?? "9", 10),
    };
}

/**
 * Returns true if the given date falls within the allowed season.
 */
export function isInSeason(date: Date): boolean {
    const { startMonth, endMonth } = getSeasonConstraints();
    const month = date.getMonth() + 1;
    return month >= startMonth && month <= endMonth;
}
