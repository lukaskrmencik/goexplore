import { MapContainer } from 'react-leaflet'
import { TileLayer } from 'react-leaflet/TileLayer'
import { MAP_CONFIG } from "../../../config/mapConfig";


interface LeafletMapProps {
	children?: React.ReactNode;
}

const LeafletMap: React.FC<LeafletMapProps> = ( {children} ) => {
	return (
		<MapContainer 
			center={MAP_CONFIG.defaultCenter}
			zoom={MAP_CONFIG.defaultZoom}
			className="w-full h-screen" 
		>
			<TileLayer
				attribution={MAP_CONFIG.attribution}
				url={MAP_CONFIG.tileUrl}
			/>

			{children}

		</MapContainer>
	)
}

export default LeafletMap