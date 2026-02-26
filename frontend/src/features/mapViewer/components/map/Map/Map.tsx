import React from 'react'
import type { RoutePoi, RouteCluster, RouteCamp } from "../../../../../types/routes";
import LeafletMap from '../../../../../components/LeafletMap/LeafletMap'
import PoiMarker from '.././PoiMarker/PoiMarker';
import CampMarker from '.././CampMarker/CampMarker';
import ClusterMarker from '.././ClusterMarker/ClusterMarker';
import RoutePolyline from '.././RoutePolyline/RoutePolyline';
import UserMarker from '../UserMarker/UserMarker';
import FitBounds from '../FitBounds/FitBounds';
import type { LineString, Point } from "geojson";
import type { RouteUser, User } from "../../../../../types/users";
import { Marker } from "react-leaflet";
import { geojsonPointToLatLng } from "../../../../../utils/geo";
import { Play, Flag } from 'lucide-react';
import { createCustomIcon } from '../../../../../utils/mapIcons/mapIcons';

const startIcon = createCustomIcon(Play, {
    color: "#ffffff",
    bgColor: "#10b981",
    size: 40,
    iconSize: 20
});

const endIcon = createCustomIcon(Flag, {
    color: "#ffffff",
    bgColor: "#ef4444",
    size: 40,
    iconSize: 20
});

interface MapProps {
    pois?: RoutePoi[];
    camps?: RouteCamp[];
    clusters?: RouteCluster[];
    routeLine?: LineString;
    start?: Point;
    end?: Point;
    users?: RouteUser[];
    user?: User;
    onPoiClick?: (id: number) => void;
    onCampClick?: (id: number) => void;
}

const Map: React.FC<MapProps> = ({ pois, camps, clusters, routeLine, start, end, users, user, onPoiClick, onCampClick }) => (
    <div>
        <LeafletMap>
            <FitBounds lineString={routeLine} start={start} end={end} />

            {pois && pois.map((poi, index) => (
                <PoiMarker key={`poi-${poi.id}-${index}`} poi={poi} onClick={onPoiClick} />
            ))}

            {camps && camps.map((camp, index) => (
                <CampMarker key={`camp-${camp.id}-${index}`} camp={camp} onClick={onCampClick} />
            ))}

            {clusters && clusters.map((cluster, index) => (
                <ClusterMarker key={`cluster-${cluster.id}-${index}`} cluster={cluster} />
            ))}

            {routeLine && <RoutePolyline routeLinestring={routeLine} />}

            {start && <Marker position={geojsonPointToLatLng(start)} icon={startIcon} />}

            {end && <Marker position={geojsonPointToLatLng(end)} icon={endIcon} />}

            {user && <UserMarker user={user} />}

            {users && users.map((u, i) => (
                <UserMarker key={`crew-${u.id}-${i}`} user={u} />
            ))}
        </LeafletMap>
    </div>
);

export default Map;
