import { Polyline } from 'react-leaflet';
import type { LineString } from "geojson";
import { geoJsonLineStringToLatLng } from "../../../../../utils/geo";

interface RoutePolylineProps {
  routeLinestring: LineString;
}

const RoutePolyline: React.FC<RoutePolylineProps> = ({ routeLinestring }) => {
  const positions = geoJsonLineStringToLatLng(routeLinestring);

  return (
    <>
      <Polyline
        positions={positions}
        pathOptions={{
          color: "#000000",
          weight: 8,
          opacity: 0.25,
          lineCap: 'round',
          lineJoin: 'round'
        }}
      />

      <Polyline
        positions={positions}
        pathOptions={{
          color: "#064e3b",
          weight: 6,
          opacity: 1,
          lineCap: 'round',
          lineJoin: 'round'
        }}
      />

      <Polyline
        positions={positions}
        pathOptions={{
          color: "#34d399",
          weight: 6,
          opacity: 1,
          lineCap: 'round',
          lineJoin: 'round',
          dashArray: '15, 20'
        }}
      />
    </>
  );
};

export default RoutePolyline;