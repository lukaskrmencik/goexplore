import type { FeatureCollection, Polygon, MultiPolygon, Position } from 'geojson';

let cachedPolygons: Position[][] | null = null;
let loadingPromise: Promise<void> | null = null;

async function loadBoundary(): Promise<void> {
    if (cachedPolygons) return;

    const res = await fetch('/cze_boundaries.geojson');
    const data: FeatureCollection = await res.json();

    const polygons: Position[][] = [];

    for (const feature of data.features) {
        const geom = feature.geometry;
        if (geom.type === 'Polygon') {
            polygons.push((geom as Polygon).coordinates[0]);
        } else if (geom.type === 'MultiPolygon') {
            for (const poly of (geom as MultiPolygon).coordinates) {
                polygons.push(poly[0]);
            }
        }
    }

    cachedPolygons = polygons;
}

export async function preloadCzechBoundary(): Promise<void> {
    if (!loadingPromise) {
        loadingPromise = loadBoundary();
    }
    await loadingPromise;
}

function pointInRing(lat: number, lng: number, ring: Position[]): boolean {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const xi = ring[i][0], yi = ring[i][1];
        const xj = ring[j][0], yj = ring[j][1];

        const intersect = ((yi > lat) !== (yj > lat)) &&
            (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

export function isInsideCzechRepublic(lat: number, lng: number): boolean {
    if (!cachedPolygons) return true;

    if (lat < 48.55 || lat > 51.10 || lng < 12.05 || lng > 18.90) {
        return false;
    }

    for (const ring of cachedPolygons) {
        if (pointInRing(lat, lng, ring)) return true;
    }
    return false;
}
