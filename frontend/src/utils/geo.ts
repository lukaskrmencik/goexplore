import type { Point, LineString } from "geojson";
import type { LatLngExpression } from "leaflet";

export const geojsonPointToLatLng = (point: Point): LatLngExpression => {
    const coords = point.coordinates;
    return [coords[1], coords[0]];
};

export const geoJsonLineStringToLatLng = (lineString: LineString): LatLngExpression[] => {
    const coords = lineString.coordinates;
    return coords.map(coord => [coord[1], coord[0]]);
};