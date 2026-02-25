export interface SearchResult {
    place_id: number;
    lat: string;
    lon: string;
    display_name: string;
}

export interface MapyCzGeocodeItem {
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

export interface MapyCzResponse {
    items: MapyCzGeocodeItem[];
}
