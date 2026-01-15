import axios from "axios";

export interface SearchResult {
    place_id: number;
    lat: string;
    lon: string;
    display_name: string;
}

export const searchPlace = async (query: string): Promise<SearchResult[]> => {
    if (!query || query.length < 3) return [];
    
    try {
        const response = await axios.get<SearchResult[]>(`https://nominatim.openstreetmap.org/search`, {
            params: {
                q: query,
                format: 'json',
                addressdetails: 1,
                limit: 5
            }
        });
        return response.data;
    } catch (error) {
        console.error("Geocoding error:", error);
        return [];
    }
};