import { useState } from 'react';
import { deleteRoute, removeUserFromRoute } from '../../../../services/routesApiService';
import { decodeJwtUserId, AUTH_TOKEN_KEY } from '../../../../utils/auth';

export const useRouteActions = (onSuccess: () => void) => {

    const [routeIdToDelete, setRouteIdToDelete] = useState<number | null>(null);
    const [routeIdToUnjoin, setRouteIdToUnjoin] = useState<number | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const requestDelete = (routeId: number) => setRouteIdToDelete(routeId);
    const requestUnjoin = (routeId: number) => setRouteIdToUnjoin(routeId);
    const cancelDelete = () => setRouteIdToDelete(null);
    const cancelUnjoin = () => setRouteIdToUnjoin(null);

    const confirmDelete = async () => {

        if (routeIdToDelete === null) return;
        setIsProcessing(true);
        try {
            await deleteRoute(routeIdToDelete);
            onSuccess();
        } catch {
            alert('Nepodařilo se smazat trasu. Zkuste to prosím znovu.');
        } finally {
            setIsProcessing(false);
            setRouteIdToDelete(null);
        }

    };

    const confirmUnjoin = async () => {

        if (routeIdToUnjoin === null) return;
        setIsProcessing(true);

        try {
            const token = localStorage.getItem(AUTH_TOKEN_KEY);
            if (!token) throw new Error('Not authenticated');
            const currentUserId = decodeJwtUserId(token);
            await removeUserFromRoute(routeIdToUnjoin, currentUserId);
            onSuccess();

        } catch {
            alert('Nepodařilo se odpojit z trasy. Zkuste to prosím znovu.');

        } finally {
            setIsProcessing(false);
            setRouteIdToUnjoin(null);
        }
    };

    return {
        routeIdToDelete,
        routeIdToUnjoin,
        isProcessing,
        requestDelete,
        requestUnjoin,
        cancelDelete,
        cancelUnjoin,
        confirmDelete,
        confirmUnjoin,
    };
};
