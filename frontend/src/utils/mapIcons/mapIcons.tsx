import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import type { LucideIcon } from 'lucide-react';
import './mapIcons.css';

const MARKER_BASE_CLASS = "custom-marker-base";

export const createCustomIcon = (
    Icon: LucideIcon,
    params: {
        color: string;
        bgColor: string;
        size?: number;
        iconSize?: number;
    }
) => {
    const { color, bgColor, size = 36, iconSize = 20 } = params;

    const html = renderToStaticMarkup(
        <div
            className={MARKER_BASE_CLASS}
            style={{ width: `${size}px`, height: `${size}px`, backgroundColor: bgColor, color }}
        >
            <Icon size={iconSize} strokeWidth={2.5} />
            <div className="custom-marker-pointer" style={{ backgroundColor: bgColor }} />
        </div>
    );

    return L.divIcon({
        html,
        className: 'custom-marker-icon',
        iconSize: [size, size],
        iconAnchor: [size / 2, size + 4],
        popupAnchor: [0, -size - 4],
    });
};

export const createDotIcon = (color: string, size = 12) => {
    const html = renderToStaticMarkup(
        <div
            className="custom-dot-marker"
            style={{ width: `${size}px`, height: `${size}px`, backgroundColor: color }}
        />
    );

    return L.divIcon({
        html,
        className: 'custom-dot-icon',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
};
