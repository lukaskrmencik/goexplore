import { Marker } from "react-leaflet";
import type { RouteCamp } from "../../../../../types/routes";
import { geojsonPointToLatLng } from "../../../../../utils/geo";
import 'leaflet.awesome-markers';
import { Tent } from 'lucide-react';
import { createCustomIcon } from '../../../../../utils/mapIcons/mapIcons';

interface CampMarkerProps {
    camp: RouteCamp;
    onClick?: (id: number) => void;
}

const campIcon = createCustomIcon(Tent, {
    color: "#ffffff",
    bgColor: "#166534",
    size: 32,
    iconSize: 18
});

const CampMarker: React.FC<CampMarkerProps> = ({ camp, onClick }) => {

    const position = geojsonPointToLatLng(camp.location)

    return (
        <Marker
            position={position}
            icon={campIcon}
            eventHandlers={{
                click: () => onClick && onClick(camp.id),
            }}
        />
    );
};

export default CampMarker;