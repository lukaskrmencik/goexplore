export const MAP_CONFIG = {
    tileUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    defaultCenter: [
        parseFloat(import.meta.env.VITE_MAP_DEFAULT_CENTER_LAT ?? "49.743757"),
        parseFloat(import.meta.env.VITE_MAP_DEFAULT_CENTER_LNG ?? "15.338638"),
    ] as [number, number],
    defaultZoom: Number(import.meta.env.VITE_MAP_DEFAULT_ZOOM ?? "7"),
};