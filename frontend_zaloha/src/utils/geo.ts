import type { Point, LineString, Position } from "geojson";
import type { LatLngExpression, LatLng } from "leaflet";

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