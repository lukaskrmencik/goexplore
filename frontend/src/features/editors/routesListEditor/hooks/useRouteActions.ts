import { useState } from 'react';
import { deleteRoute, removeUserFromRoute } from '../../../../services/routesApiService';
import { decodeJwtUserId } from '../../../../utils/auth';

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
        } catch (err) {
            console.error('Nepodařilo se smazat cestu', err);
            alert('Nepodařilo se smazat cestu. Zkuste to prosím znovu.');
        } finally {
            setIsProcessing(false);
            setRouteIdToDelete(null);
        }
    };

    const confirmUnjoin = async () => {
        if (routeIdToUnjoin === null) return;
        setIsProcessing(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Not authenticated');
            const currentUserId = decodeJwtUserId(token);
            await removeUserFromRoute(routeIdToUnjoin, currentUserId);
            onSuccess();
        } catch (err) {
            console.error('Nepodařilo se odpojit od cesty', err);
            alert('Nepodařilo se odpojit z cesty. Zkuste to prosím znovu.');
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
