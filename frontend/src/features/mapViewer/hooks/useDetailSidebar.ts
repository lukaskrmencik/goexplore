import { useState, useEffect } from 'react';
import { fetchPoiDetail } from '../../../services/poiApiService';
import { fetchCampDetail } from '../../../services/campsApiService';

export const useDetailSidebar = (type: 'poi' | 'camp' | null, id: number | null) => {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!type || !id) {
            setData(null);
            return;
        }

        setIsLoading(true);
        const fetcher = type === 'poi' ? fetchPoiDetail : fetchCampDetail;
        fetcher(id)
            .then(setData)
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [type, id]);

    return { data, isLoading };
};
