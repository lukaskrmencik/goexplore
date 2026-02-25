export interface OpeningHours {
    month_from: number;
    month_to: number;
    days: Record<string, { from: string; to: string }>;
}

export interface NamedItem {
    id: number;
    name: string;
}

export interface PoiDetail {
    id: number;
    name: string;
    image_url?: string;
    category?: NamedItem;
    review?: number;
    review_count?: number;
    website?: string;
    kudyznudy_url?: string;
    price_list_url?: string;
    price?: number | string;
    discounted_price?: number | string;
    time_required?: number | string;
    opening_hours?: OpeningHours[];
    equipment?: NamedItem[];
    labels?: NamedItem[];
    tags?: NamedItem[];
}

export interface CampDetail {
    id: number;
    name: string;
    image_url?: string;
    review?: number;
    review_count?: number;
    web?: string;
    url?: string;
    operating_time_month_from?: number;
    operating_time_month_to?: number;
    operating_time_day_from?: number;
    operating_time_day_to?: number;
    accept_cards?: string;
    accommodation_types?: NamedItem[];
    service?: NamedItem[];
    equipment?: NamedItem[];
    tags?: NamedItem[];
}

export type ViewerDetailData = PoiDetail & CampDetail;
