import axios from "axios";
import qs from "qs";

export interface SearchResult {
    place_id: number;
    lat: string;
    lon: string;
    display_name: string;
}

// Mapy.cz Geocode API types
interface MapyCzGeocodeItem {
    name: string;
    label: string;
    location: string;
    position: {
        lat: number;
        lon: number;
    };
    type: string;
    zip?: string;
}

interface MapyCzResponse {
    items: MapyCzGeocodeItem[];
}

export const searchPlace = async (query: string): Promise<SearchResult[]> => {
    if (!query || query.length < 2) return [];

    const apiKey = import.meta.env.VITE_MAPY_COM_API_KEY;
    if (!apiKey) {
        console.error("Mapy.cz API key is missing");
        return [];
    }

    try {
        // Use qs for array parameter serialization to match 'type=...&type=...' format if needed,
        // but axios paramsSerializer can also handle it. Let's use correct params.
        const response = await axios.get<MapyCzResponse>(`https://api.mapy.cz/v1/geocode`, {
            params: {
                apikey: apiKey,
                query: query,
                limit: 15,
                lang: 'cs',
                type: [
                    'regional.municipality',
                    'regional.municipality_part',
                    'regional.street',
                    'regional.address',
                    'coordinate'
                ]
            },
            paramsSerializer: params => {
                return qs.stringify(params, { arrayFormat: 'repeat' });
            }
        });

        if (!response.data.items) return [];

        return response.data.items.map((item, index) => {
            const name = item.name;
            const context = item.location;
            const displayName = context ? `${name}, ${context}` : name;

            return {
                place_id: index, // Geocode items might not have a stable ID in this response, using index or fallback
                lat: item.position.lat.toString(),
                lon: item.position.lon.toString(),
                display_name: displayName
            };
        });
    } catch (error) {
        console.error("Geocoding error:", error);
        return [];
    }
};