import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import type { LucideIcon } from 'lucide-react';
import React from 'react';

// Common marker styles
const MARKER_BASE_CLASS = "relative flex items-center justify-center rounded-full shadow-lg border-2 border-white transition-transform hover:scale-110";

// Helper to create a custom marker icon
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
            style={{
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: bgColor,
                color: color,
            }}
        >
            <Icon size={iconSize} strokeWidth={2.5} />
            {/* Triangle pointer at bottom */}
            <div
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border-r-2 border-b-2 border-white"
                style={{ backgroundColor: bgColor }}
            />
        </div>
    );

    return L.divIcon({
        html: html,
        className: 'custom-marker-icon', // Empty class to remove default styles
        iconSize: [size, size],
        iconAnchor: [size / 2, size + 4], // Anchor at bottom tip
        popupAnchor: [0, -size - 4],
    });
};

// Simplified dot marker for less important points
export const createDotIcon = (color: string, size = 12) => {
    const html = renderToStaticMarkup(
        <div
            className="rounded-full border-2 border-white shadow-md hover:scale-125 transition-transform"
            style={{
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: color,
            }}
        />
    );

    return L.divIcon({
        html: html,
        className: 'custom-dot-icon',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
};
