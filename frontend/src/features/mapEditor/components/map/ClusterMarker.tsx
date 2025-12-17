import { Circle } from "react-leaflet";
import type { RouteCluster } from "../../../../types/routes";
import { geojsonPointToLatLng } from "../../../../utils/geo";
import 'leaflet.awesome-markers';

interface ClusterMarkerProps {
    cluster: RouteCluster
}

const ClusterMarker: React.FC<ClusterMarkerProps> = ({ cluster }) => {

    const position = geojsonPointToLatLng(cluster.location)

    return (
        <Circle
            center={position}
            radius={250}
            pathOptions={{
                color: "#2563eb",
                weight: 2,
                fillColor: "#3b82f6",
                fillOpacity: 0.25,
            }}
        />
    );
};

export default ClusterMarker;