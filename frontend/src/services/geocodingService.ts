import axios from "axios";
import qs from "qs";
import type { SearchResult, MapyCzResponse } from "../types/geocoding";

export type { SearchResult };

const GEOCODING_RESULT_LIMIT = Number(import.meta.env.VITE_GEOCODING_RESULT_LIMIT ?? "15");
const GEOCODING_MIN_QUERY_LENGTH = Number(import.meta.env.VITE_GEOCODING_MIN_QUERY_LENGTH ?? "2");

export const searchPlace = async (query: string): Promise<SearchResult[]> => {
    if (!query || query.length < GEOCODING_MIN_QUERY_LENGTH) return [];

    const apiKey = import.meta.env.VITE_MAPY_CZ_API_KEY;
    if (!apiKey) return [];

    try {
        const response = await axios.get<MapyCzResponse>(`https://api.mapy.cz/v1/geocode`, {
            params: {
                apikey: apiKey,
                query: query,
                limit: GEOCODING_RESULT_LIMIT,
                lang: 'cs',
                locality: 'cz',
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
                place_id: index,
                lat: item.position.lat.toString(),
                lon: item.position.lon.toString(),
                display_name: displayName
            };
        });
    } catch {
        return [];
    }
};