import { useState, useEffect } from "react";
import type { Route, RoutePoi, RouteCluster } from '../../../types/routes';

export const usePois = (route?: Route) => {
    const [pois, setPois] = useState<RoutePoi[]>([]);
    const [clusters, setClusters] = useState<RouteCluster[]>([]);

    useEffect(() => {
        const makePoiList = () => {
            if (!route?.poi) {
                setPois([]);
                setClusters([]);
                return;
            }

            const newPois: RoutePoi[] = [];
            const newClusters: RouteCluster[] = [];

            for (const poi of route.poi) {
                if (poi.type === "cluster") {
                    if (poi.cluster) {
                        newClusters.push(poi.cluster);
                    }
                    if (poi.poi_data) {
                        newPois.push(...poi.poi_data);
                    }
                } else if (poi.type === "single") {
                    if (poi.poi_data) {
                        newPois.push(...poi.poi_data);
                    }
                }
            }

            setPois(newPois);
            setClusters(newClusters);
        };

        makePoiList();
    }, [route]);

    return { pois, clusters };
}