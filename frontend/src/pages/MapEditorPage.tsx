import React from 'react'
import Map from '../features/mapEditor/components/map/Map'
import { useMapEditor } from "../features/mapEditor/hooks/useMapEditor";
import { useLocation } from "react-router-dom";


const MapEditorPage: React.FC = () => {

    const location = useLocation();
	const searchParams = new URLSearchParams(location.search);
	const routeIdString = searchParams.get("id"); 

	const routeId = routeIdString ? parseInt(routeIdString) : null;

    const { route, loading, error, pois, camps, clusters, routeLine } = useMapEditor(routeId);

    console.log(route)
    console.log(pois)
    console.log(clusters)
	console.log(error)

    return (
      <div>
        <Map pois={pois} camps={camps} clusters={clusters} routeLine={routeLine}/>
      </div>
    )
}

export default MapEditorPage