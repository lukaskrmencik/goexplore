import { Marker, Popup } from "react-leaflet";
import { createMarkerIcon } from "../../../../utils/mapIcons";
import type { LatLngExpression } from "leaflet";

interface EditorPoint {
    id: string;
    lat: number;
    lng: number;
    type: 'start' | 'end' | 'waypoint';
    name?: string;
}

interface EditorMarkersProps {
    points: EditorPoint[];
}

const EditorMarkers: React.FC<EditorMarkersProps> = ({ points }) => {
    return (
        <>
            {points.map((point) => (
                <Marker 
                    key={point.id} 
                    position={[point.lat, point.lng] as LatLngExpression}
                    icon={createMarkerIcon(point.type)}
                >
                    <Popup>
                        <strong>{point.type === 'start' ? 'Start' : point.type === 'end' ? 'Cíl' : 'Waypoint'}</strong>
                        <br />
                        {point.name || "Bez názvu"}
                    </Popup>
                </Marker>
            ))}
        </>
    );
};

export default EditorMarkers;