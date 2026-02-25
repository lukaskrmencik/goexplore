export function formatRouteLength(meters?: number): string {
    if (!meters) return '- km';
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
}
