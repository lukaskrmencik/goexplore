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
            radius={500}
            pathOptions={{
                color: "#4ade80", // emerald-400
                weight: 2,
                fillColor: "#4ade80",
                fillOpacity: 0.2,
            }}
        />
    );
};

export default ClusterMarker;