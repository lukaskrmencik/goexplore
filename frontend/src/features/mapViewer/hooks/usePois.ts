import { useState, useEffect } from "react";
import type { Route, RoutePoi, RouteCluster } from '../../../types/routes';

function extractPoisAndClusters(route: Route): { pois: RoutePoi[]; clusters: RouteCluster[] } {
    const pois: RoutePoi[] = [];
    const clusters: RouteCluster[] = [];


    for (const poiWrapper of route.poi) {
        if (poiWrapper.type === "cluster") {
            if (poiWrapper.cluster) clusters.push(poiWrapper.cluster);
            if (poiWrapper.poi_data) pois.push(...poiWrapper.poi_data);
        } else if (poiWrapper.type === "single") {
            if (poiWrapper.poi_data) pois.push(...poiWrapper.poi_data);
        }
    }

    return { pois, clusters };
}

export const usePois = (route?: Route) => {
    const [pois, setPois] = useState<RoutePoi[]>([]);
    const [clusters, setClusters] = useState<RouteCluster[]>([]);

    useEffect(() => {
        if (!route?.poi) {
            setPois([]);
            setClusters([]);
            return;
        }
        const { pois: newPois, clusters: newClusters } = extractPoisAndClusters(route);
        setPois(newPois);
        setClusters(newClusters);
    }, [route]);

    return { pois, clusters };
};
