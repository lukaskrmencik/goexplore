import type { Point, LineString, Position } from "geojson";
import type { LatLngExpression, LatLng } from "leaflet";

export const parseGeoJsonLineStringBounds = (geojsonString: string): [[number, number], [number, number]] => {
    try {
        const geojson = JSON.parse(geojsonString);
        if (geojson.type === 'LineString' && geojson.coordinates) {
            const coords: number[][] = geojson.coordinates;
            let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
            coords.forEach(coord => {
                const lng = coord[0];
                const lat = coord[1];
                if (lat < minLat) minLat = lat;
                if (lat > maxLat) maxLat = lat;
                if (lng < minLng) minLng = lng;
                if (lng > maxLng) maxLng = lng;
            });
            const padLat = (maxLat - minLat) * 0.1 || 0.01;
            const padLng = (maxLng - minLng) * 0.1 || 0.01;
            return [
                [minLat - padLat, minLng - padLng],
                [maxLat + padLat, maxLng + padLng],
            ];
        }
    } catch {
    }
    return [[48.5, 12.0], [51.0, 18.8]];
};

export const geojsonPointToLatLng = (point: Point): LatLngExpression => {
    const coords = point.coordinates;
    return [coords[1], coords[0]];
};

export const geoJsonLineStringToLatLng = (lineString: LineString): LatLngExpression[] => {
    const coords = lineString.coordinates;
    return coords.map(coord => [coord[1], coord[0]]);
};

export const latLngToGeoJsonPoint = (lat: number, lng: number): Point => {
    return {
        type: "Point",
        coordinates: [lng, lat]
    };
};

export const leafletLatLngToGeoJsonLineString = (latlngs: LatLng[]): LineString => {
    const coordinates: Position[] = latlngs.map(ll => [ll.lng, ll.lat]);
    return {
        type: "LineString",
        coordinates: coordinates
    };
};