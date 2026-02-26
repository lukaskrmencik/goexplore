import { Polyline } from 'react-leaflet';
import type { LineString } from "geojson";
import { geoJsonLineStringToLatLng } from "../../../../../utils/geo";

interface RoutePolylineProps {
    routeLinestring: LineString;
}

const RoutePolyline: React.FC<RoutePolylineProps> = ({ routeLinestring }) => {

    const positions = geoJsonLineStringToLatLng(routeLinestring)

    return (
        <>
            {/* 1. Shadow for visibility (Subtle) */}
            <Polyline
                positions={positions}
                pathOptions={{
                    color: "#000000",
                    weight: 8,
                    opacity: 0.25,
                    lineCap: 'round',
                    lineJoin: 'round'
                }}
            />

            {/* 2. Base Line (Dark Green) */}
            <Polyline
                positions={positions}
                pathOptions={{
                    color: "#064e3b", // emerald-900
                    weight: 6, // Slightly wider for base? No, same width looks cleaner for alternate
                    opacity: 1,
                    lineCap: 'round',
                    lineJoin: 'round'
                }}
            />

            {/* 3. Dashed Line (Light Green) - Creates alternating effect */}
            <Polyline
                positions={positions}
                pathOptions={{
                    color: "#34d399", // emerald-400
                    weight: 6,
                    opacity: 1,
                    lineCap: 'round',
                    lineJoin: 'round',
                    dashArray: '15, 20' // 15px line, 20px gap
                }}
            />
        </>
    );
};

export default RoutePolyline;