export const SIMPLE_MODE_CONFIG = {
    BUFFER_SIZE_KM: Number(import.meta.env.VITE_SIMPLE_BUFFER_SIZE_KM ?? "20"),
    MAX_ROUTE_LENGTH_DAY: Number(import.meta.env.VITE_SIMPLE_MAX_ROUTE_LENGTH_DAY ?? "200"),
    POI_PER_DAY: Number(import.meta.env.VITE_SIMPLE_POI_PER_DAY ?? "5"),
    BUFFER_RETRY_STAGES: (import.meta.env.VITE_SIMPLE_BUFFER_RETRY_STAGES ?? "20,30,50").split(',').map(Number),
};
