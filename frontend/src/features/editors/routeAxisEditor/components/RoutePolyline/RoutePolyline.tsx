import { Polyline } from "react-leaflet";
import type { LatLngExpression, LeafletMouseEvent } from "leaflet";

interface RoutePolylineProps {
    coordinates: LatLngExpression[];
    onSegmentClick?: (segmentIndex: number, lat: number, lng: number) => void;
}

const RoutePolyline: React.FC<RoutePolylineProps> = ({ coordinates, onSegmentClick }) => {
    return (
        <>
            <Polyline
                positions={coordinates}
                pathOptions={{
                    color: "#000000",
                    weight: 8,
                    opacity: 0.25,
                    lineCap: 'round',
                    lineJoin: 'round'
                }}
            />

            <Polyline
                positions={coordinates}
                pathOptions={{
                    color: "#064e3b",
                    weight: 6,
                    opacity: 1,
                    lineCap: 'round',
                    lineJoin: 'round'
                }}
            />

            <Polyline
                positions={coordinates}
                pathOptions={{
                    color: "#34d399",
                    weight: 6,
                    opacity: 1,
                    lineCap: 'round',
                    lineJoin: 'round',
                    dashArray: '15, 20'
                }}
            />

            {onSegmentClick && coordinates.length >= 2 && coordinates.map((_, i) => {

                if (i >= coordinates.length - 1) return null;
                const segmentCoords = [coordinates[i], coordinates[i + 1]];

                return (

                    <Polyline
                        key={`segment-click-${i}`}
                        positions={segmentCoords}
                        pathOptions={{
                            color: "transparent",
                            weight: 24,
                            opacity: 0,
                        }}

                        eventHandlers={{
                            click: (e: LeafletMouseEvent) => {
                                e.originalEvent.stopPropagation();
                                onSegmentClick(i, e.latlng.lat, e.latlng.lng);
                            },

                            mouseover: (e) => {
                                const el = (e.target as LeafletMouseEvent['target'] & { _path?: SVGElement })._path;
                                if (el) el.style.cursor = 'copy';
                            },
                            
                            mouseout: (e) => {
                                const el = (e.target as LeafletMouseEvent['target'] & { _path?: SVGElement })._path;
                                if (el) el.style.cursor = '';
                            }
                        }}
                    />
                );
            })}
        </>
    );
};

export default RoutePolyline;
