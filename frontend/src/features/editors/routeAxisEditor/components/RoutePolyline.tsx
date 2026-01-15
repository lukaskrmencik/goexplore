import { Polyline } from "react-leaflet";
import type { LatLngExpression } from "leaflet";

interface RoutePolylineProps {
    coordinates: LatLngExpression[];
}

const RoutePolyline: React.FC<RoutePolylineProps> = ({ coordinates }) => {
    return (
        <Polyline 
            positions={coordinates} 
            pathOptions={{ color: 'blue', weight: 4, opacity: 0.7 }} 
        />
    );
};

export default RoutePolyline;