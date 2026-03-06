import { useEffect, useState } from "react";
import { GeoJSON } from "react-leaflet";
import type { FeatureCollection, Feature, Polygon, MultiPolygon } from "geojson";

const CzechBoundaryOverlay: React.FC = () => {
    const [maskFeature, setMaskFeature] = useState<FeatureCollection | null>(null);
    const [borderFeature, setBorderFeature] = useState<FeatureCollection | null>(null);

    useEffect(() => {

        fetch("/cze_boundaries.geojson")
            .then((res) => res.json())
            .then((data: FeatureCollection) => {

                const czFeature = data.features.find(
                    (f) => f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon"
                );
                if (!czFeature) return;

                setBorderFeature({
                    type: "FeatureCollection",
                    features: [czFeature],
                });

                const worldRing: [number, number][] = [
                    [-90, -180],
                    [-90, 180],
                    [90, 180],
                    [90, -180],
                    [-90, -180],
                ];

                let czRings: [number, number][][];
                
                if (czFeature.geometry.type === "Polygon") {
                    czRings = (czFeature.geometry as Polygon).coordinates as [number, number][][];
                } else {
                    czRings = (czFeature.geometry as MultiPolygon).coordinates.map(
                        (poly) => poly[0] as [number, number][]
                    );
                }

                const invertedFeature: Feature<Polygon> = {
                    type: "Feature",
                    properties: {},
                    geometry: {
                        type: "Polygon",
                        coordinates: [worldRing, ...czRings],
                    },
                };

                setMaskFeature({
                    type: "FeatureCollection",
                    features: [invertedFeature],
                });
            })
            .catch(() => {});
    }, []);

    return (
        <>
            {maskFeature && (
                <GeoJSON
                    data={maskFeature}
                    style={{
                        fillColor: "#ef4444",
                        fillOpacity: 0.12,
                        color: "transparent",
                        weight: 0,
                    }}
                    interactive={false}
                />
            )}

            {borderFeature && (
                <GeoJSON
                    data={borderFeature}
                    style={{
                        fillColor: "transparent",
                        fillOpacity: 0,
                        color: "#dc2626",
                        weight: 2,
                        opacity: 0.5,
                        dashArray: "6, 4",
                    }}
                    interactive={false}
                />
            )}
        </>
    );
};

export default CzechBoundaryOverlay;
