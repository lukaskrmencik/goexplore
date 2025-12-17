import { Marker, Popup } from "react-leaflet";
import Leaflet from "leaflet";
import type { RouteCamp } from "../../../../types/routes";
import { geojsonPointToLatLng } from "../../../../utils/geo";
import 'leaflet.awesome-markers';

interface CampMarkerProps {
    camp: RouteCamp
}

// Custom ikona pro POI
const campIcon = Leaflet.AwesomeMarkers.icon({
  icon: "free-code-camp",
  markerColor: "green",
  prefix: "fa"
});

const CampMarker: React.FC<CampMarkerProps> = ({ camp }) => {

    const position = geojsonPointToLatLng(camp.location)

    return (
        <Marker position={position} icon={campIcon}>
            <Popup>
                <strong>{camp.name}</strong>
            </Popup>
        </Marker>
    );
};

export default CampMarker;