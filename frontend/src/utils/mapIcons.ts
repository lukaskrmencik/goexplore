import L from "leaflet";
import "leaflet.awesome-markers";

export const createMarkerIcon = (type: 'start' | 'end' | 'waypoint' | 'default') => {
    let color = 'blue';
    let icon = 'info';

    switch (type) {
        case 'start':
            color = 'green';
            icon = 'play';
            break;
        case 'end':
            color = 'red';
            icon = 'flag-checkered';
            break;
        case 'waypoint':
            color = 'blue';
            icon = 'map-marker';
            break;
        default:
            color = 'cadetblue';
            icon = 'circle';
    }

    return L.AwesomeMarkers.icon({
        icon: icon,
        markerColor: color as "blue" | "cadetblue" | "darkgreen" | "darkred" | "green" | "orange" | "purple" | "red" | "darkpurple",
        prefix: 'fa', 
        iconColor: 'white'
    });
};