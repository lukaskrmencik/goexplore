import { useMapEvents } from "react-leaflet";

interface MapClickHandlerProps {
    onMapClick: (lat: number, lng: number) => void;
    isActive: boolean;
}

const MapClickHandler: React.FC<MapClickHandlerProps> = ({ onMapClick, isActive }) => {
    useMapEvents({
        click(e) {
            if (isActive) {
                onMapClick(e.latlng.lat, e.latlng.lng);
            }
        },
    });
    return null;
};

export default MapClickHandler;