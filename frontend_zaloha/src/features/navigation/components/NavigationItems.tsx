import { Map, Tent, User, Navigation } from "lucide-react";

export interface NavItem {
    id: string;
    label: string;
    icon: any;
    path: string;
    disabled?: boolean;
    special?: boolean; // Pro "Aktuální trasu"
}

export const getNavItems = (activeRouteId: string | null): NavItem[] => [
    {
        id: 'current-route',
        label: 'Mapa', // Nebo "Aktuální"
        icon: Navigation, // Ikonka šipky/navigace
        path: activeRouteId ? `/routes/${activeRouteId}/location` : '#',
        disabled: !activeRouteId,
        special: true
    },
    {
        id: 'routes',
        label: 'Trasy',
        icon: Map,
        path: '/',
    },
    {
        id: 'equipment',
        label: 'Vybavení',
        icon: Tent,
        path: '/equipment', // Placeholder page
    },
    {
        id: 'account',
        label: 'Účet',
        icon: User,
        path: '/account', // Placeholder page
    }
];
