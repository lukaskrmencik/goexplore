import React, { useEffect } from 'react';
import { useMap } from "react-leaflet";
import Leaflet from "leaflet";
import type { LineString, Point } from "geojson";
import { geojsonPointToLatLng } from "../../../../../utils/geo";

interface FitBoundsProps {
    lineString?: LineString;
    start?: Point;
    end?: Point;
}

const FitBounds: React.FC<FitBoundsProps> = ({ lineString, start, end }) => {

    const map = useMap();
    const hasFitRef = React.useRef<{ startEnd: boolean; line: boolean }>({
        startEnd: false,
        line: false,
    });

    useEffect(() => {

        if (hasFitRef.current.line) return;
        if (!lineString && !start && !end) return;

        const bounds = Leaflet.latLngBounds([]);
        let isLinePresent = false;

        if (lineString) {
            isLinePresent = true;
            lineString.coordinates.forEach((coord) => {
                bounds.extend([coord[1], coord[0]]);
            });
        }

        if (start) bounds.extend(geojsonPointToLatLng(start));
        if (end) bounds.extend(geojsonPointToLatLng(end));

        
        if (!bounds.isValid()) return;

        if (!isLinePresent && hasFitRef.current.startEnd) return;

        map.fitBounds(bounds, { padding: [50, 50] });

        if (isLinePresent) {
            hasFitRef.current.line = true;
        } else {
            hasFitRef.current.startEnd = true;
        }
    }, [lineString, start, end, map]);

    return null;
};

export default FitBounds;
