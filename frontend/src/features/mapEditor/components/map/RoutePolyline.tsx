import { Polyline } from 'react-leaflet';
import type { LineString } from "geojson";
import { geoJsonLineStringToLatLng } from "../../../../utils/geo";

interface RoutePolylineProps {
    routeLinestring: LineString;
}

const RoutePolyline: React.FC<RoutePolylineProps> = ({ routeLinestring }) => {

    const positions = geoJsonLineStringToLatLng(routeLinestring)

    return (
        <Polyline positions={positions} pathOptions={{
                color: "#ff0000",
                weight: 5,
            }}>
        </Polyline>
    );
};

export default RoutePolyline;