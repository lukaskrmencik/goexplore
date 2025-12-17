import { Marker, Popup } from "react-leaflet";
import Leaflet from "leaflet";
import type { RoutePoi } from "../../../../types/routes";
import { geojsonPointToLatLng } from "../../../../utils/geo";
import 'leaflet.awesome-markers';

interface PoiMarkerProps {
	poi: RoutePoi
}

// Custom ikona pro POI
const poiIcon = Leaflet.AwesomeMarkers.icon({
  icon: "star",
  markerColor: "blue",
  prefix: "fa"
});

const PoiMarker: React.FC<PoiMarkerProps> = ({ poi }) => {

	const position = geojsonPointToLatLng(poi.location)

  	return (
    	<Marker position={position} icon={poiIcon}>
      		<Popup>
        		<strong>{poi.name}</strong>
      		</Popup>
		</Marker>
  	);
};

export default PoiMarker;