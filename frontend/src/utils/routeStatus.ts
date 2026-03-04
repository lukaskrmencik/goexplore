import type { RouteItem } from '../types/routes';

export type RouteStatus = 'draft' | 'active' | 'past' | 'future';

export function getRouteStatus(route: RouteItem): RouteStatus {
    if (!route.length_meters || !route.start_date) return 'draft';

    const now = new Date();
    const start = new Date(route.start_date);
    const end = route.end_date
        ? new Date(route.end_date)
        : new Date(start.getTime() + 24 * 60 * 60 * 1000);

    if (end < now) return 'past';
    if (start <= now && end >= now) return 'active';
    return 'future';
}

export function getRouteStatusCssClass(status: RouteStatus): string {
    switch (status) {
        case 'active': return 'route-card-status-active';
        case 'past': return 'route-card-status-past';
        case 'future': return 'route-card-status-future';
        case 'draft': return 'route-card-status-draft';
        default: return 'route-card-status-default';
    }
}

export function getRouteStatusLabel(status: RouteStatus): string {
    switch (status) {
        case 'active': return 'Probíhá';
        case 'past': return 'Proběhlo';
        case 'future': return 'Naplánováno';
        case 'draft': return 'Rozpracováno';
        default: return '';
    }
}

export function getRouteModeLabel(mode: string): string {
    if (mode === 'simple') return 'Jednoduchý';
    if (mode === 'manual') return 'Pokročilý';
    return 'Neznámý';
}
