import { Marker } from "react-leaflet";
import type { RoutePoi } from "../../../../types/routes";
import { geojsonPointToLatLng } from "../../../../utils/geo";
import 'leaflet.awesome-markers';
import { MapPin } from 'lucide-react';
import { createCustomIcon } from '../../utils/mapIcons';

interface PoiMarkerProps {
	poi: RoutePoi;
	onClick?: (id: number) => void;
}

// Custom ikona pro POI
const poiIcon = createCustomIcon(MapPin, {
	color: "#ffffff",
	bgColor: "#f59e0b", // amber-500
	size: 32,
	iconSize: 18
});

const PoiMarker: React.FC<PoiMarkerProps> = ({ poi, onClick }) => {

	const position = geojsonPointToLatLng(poi.location)

	return (
		<Marker
			position={position}
			icon={poiIcon}
			eventHandlers={{
				click: () => onClick && onClick(poi.id),
			}}
		/>
	);
};

export default PoiMarker;