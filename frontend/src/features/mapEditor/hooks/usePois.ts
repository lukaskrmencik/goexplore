import { useState, useEffect } from "react";
import type { Route, RoutePoi, RouteCluster } from '../../../types/routes';

export const usePois = (route?: Route) => {
    const [pois, setPois] = useState<RoutePoi[]>([]);
    const [clusters, setClusters] = useState<RouteCluster[]>([]);

    useEffect(() => {
        const makePoiList = async () => {

            if (!route){
                return
            }

            console.log(`route ${route}`)
            console.log(`route.poi ${route.poi}`)

            for (const poi of route.poi){
                if (poi.type === "cluster"){
                    const cluster = poi.cluster;
                    if(cluster){
                        setClusters(prev => [...prev, cluster]);
                    }
                    setPois(prev => [...prev, ...poi.poi_data]);

                }else if (poi.type === "single"){
                    setPois(prev => [...prev, ...poi.poi_data]);
                }
            }
        };

        makePoiList();
    }, [route]);

    return { pois, clusters };
}