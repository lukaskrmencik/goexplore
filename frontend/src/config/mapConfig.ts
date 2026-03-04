export const MAP_CONFIG = {
    tileUrl: `https://api.mapy.com/v1/maptiles/basic/256/{z}/{x}/{y}?apikey=${import.meta.env.VITE_MAPY_COM_API_KEY}`,
    attribution: '<a href="https://api.mapy.com/copyright" target="_blank">&copy; Seznam.cz a.s. a další</a>',
    defaultCenter: [
        parseFloat(import.meta.env.VITE_MAP_DEFAULT_CENTER_LAT ?? "49.743757"),
        parseFloat(import.meta.env.VITE_MAP_DEFAULT_CENTER_LNG ?? "15.338638"),
    ] as [number, number],
    defaultZoom: Number(import.meta.env.VITE_MAP_DEFAULT_ZOOM ?? "7"),
};