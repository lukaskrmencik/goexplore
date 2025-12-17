import React from 'react'
import type { RoutePoi, RouteCluster, RouteCamp } from "../../../../types/routes";
import LeafletMap from '../../../leafletMap/components/LeafletMap'
import PoiMarker from './PoiMarker';
import CampMarker from './CampMarker';
import ClusterMarker from './ClusterMarker';
import RoutePolyline from './RoutePolyline';
import type { LineString } from "geojson";

interface MapProps {
    pois?: RoutePoi[]
	camps?: RouteCamp[]
	clusters?: RouteCluster[]
	routeLine?: LineString
}

const Map: React.FC<MapProps> = ({ pois, camps, clusters, routeLine }) => {

  	return (
		<div>
			<LeafletMap>
				{pois && (
                    <>
                        {pois.map(poi => (
                            <PoiMarker poi={poi}/>
                        ))}
                    </>
                )}

				{camps && (
                    <>
                        {camps.map(camp => (
                            <CampMarker camp={camp}/>
                        ))}
                    </>
                )}

				{clusters && (
                    <>
                        {clusters.map(cluster => (
                            <ClusterMarker cluster={cluster}/>
                        ))}
                    </>
                )}

				{routeLine && (
					<RoutePolyline routeLinestring={routeLine}/>
				)}
			</LeafletMap>
		</div>
  	)
}

export default Map