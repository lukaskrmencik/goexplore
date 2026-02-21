import React, { useEffect } from 'react'
import type { RoutePoi, RouteCluster, RouteCamp } from "../../../../../types/routes";
import LeafletMap from '../../../../leafletMap/components/LeafletMap/LeafletMap'
import PoiMarker from '.././PoiMarker/PoiMarker';
import CampMarker from '.././CampMarker/CampMarker';
import ClusterMarker from '.././ClusterMarker/ClusterMarker';
import RoutePolyline from '.././RoutePolyline/RoutePolyline';
import type { LineString, Point } from "geojson";
import { Marker, useMap } from "react-leaflet";
import Leaflet from "leaflet";
import { geojsonPointToLatLng } from "../../../../../utils/geo";
import { Play, Flag } from 'lucide-react';
import { createCustomIcon } from '../../../utils/mapIcons/mapIcons';

// Icons
const startIcon = createCustomIcon(Play, {
    color: "#ffffff",
    bgColor: "#10b981", // emerald-500
    size: 40,
    iconSize: 20
});

const endIcon = createCustomIcon(Flag, {
    color: "#ffffff",
    bgColor: "#ef4444", // red-500
    size: 40,
    iconSize: 20
});

// Component to fit bounds
const FitBounds: React.FC<{ lineString?: LineString, start?: Point, end?: Point }> = ({ lineString, start, end }) => {
    const map = useMap();

    useEffect(() => {
        if (!lineString && !start && !end) return;

        const bounds = Leaflet.latLngBounds([]);

        if (lineString) {
            // Accessing internal layers can be tricky, let's rely on standard bounds extension if possible
            // or just iterate points if LineString is available
            const coordinates = lineString.coordinates;
            // GeoJSON is [lon, lat], Leaflet wants [lat, lon]
            coordinates.forEach((coord) => {
                bounds.extend([coord[1], coord[0]]);
            });
        }

        if (start) bounds.extend(geojsonPointToLatLng(start));
        if (end) bounds.extend(geojsonPointToLatLng(end));

        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [lineString, start, end, map]);

    return null;
};

interface MapProps {
    pois?: RoutePoi[];
    camps?: RouteCamp[];
    clusters?: RouteCluster[];
    routeLine?: LineString;
    start?: Point;
    end?: Point;
    onPoiClick?: (id: number) => void;
    onCampClick?: (id: number) => void;
}

const Map: React.FC<MapProps> = ({ pois, camps, clusters, routeLine, start, end, onPoiClick, onCampClick }) => {

    return (
        <div>
            <LeafletMap>
                <FitBounds lineString={routeLine} start={start} end={end} />

                {pois && (
                    <>
                        {pois.map((poi, index) => (
                            <PoiMarker key={`poi-${poi.id}-${index}`} poi={poi} onClick={onPoiClick} />
                        ))}
                    </>
                )}

                {camps && (
                    <>
                        {camps.map((camp, index) => (
                            <CampMarker key={`camp-${camp.id}-${index}`} camp={camp} onClick={onCampClick} />
                        ))}
                    </>
                )}

                {clusters && (
                    <>
                        {clusters.map((cluster, index) => (
                            <ClusterMarker key={`cluster-${cluster.id}-${index}`} cluster={cluster} />
                        ))}
                    </>
                )}

                {routeLine && (
                    <RoutePolyline routeLinestring={routeLine} />
                )}

                {start && (
                    <Marker position={geojsonPointToLatLng(start)} icon={startIcon} />
                )}

                {end && (
                    <Marker position={geojsonPointToLatLng(end)} icon={endIcon} />
                )}
            </LeafletMap>
        </div>
    )
}

export default Map