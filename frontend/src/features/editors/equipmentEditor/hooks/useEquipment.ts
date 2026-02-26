import { useState, useEffect, useCallback } from 'react';
import { fetchMyEquipment, deleteMyEquipment } from '../../../../services/equipmentApiService';
import type { MyEquipment } from '../../../../types/equipment';
import { useDebounce } from '../../../../hooks/useDebounce';
import { getErrorMessage } from '../../../../utils/apiError';

const EQUIPMENT_SEARCH_DEBOUNCE_MS = Number(import.meta.env.VITE_EQUIPMENT_SEARCH_DEBOUNCE ?? "300");

export const useEquipment = () => {
    const [equipmentList, setEquipmentList] = useState<MyEquipment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const debouncedSearch = useDebounce(search, EQUIPMENT_SEARCH_DEBOUNCE_MS);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    const loadEquipment = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data, meta } = await fetchMyEquipment(page, debouncedSearch);
            setEquipmentList(data || []);
            setTotalPages(meta?.total_pages || 1);
        } catch (err) {
            setError(getErrorMessage(err, "Nepodařilo se načíst vybavení."));
        } finally {
            setIsLoading(false);
        }
    }, [page, debouncedSearch]);

    useEffect(() => {
        loadEquipment();
    }, [loadEquipment]);

    const handleEquipmentCreated = () => {
        loadEquipment();
    };

    const handleDeleteEquipment = async (id: number) => {
        setProcessingId(id);
        setError(null);
        try {
            await deleteMyEquipment(id);
            setEquipmentList(prev => prev.filter(item => item.id !== id));
            if (equipmentList.length === 1 && page > 1) {
                setPage(p => p - 1);
            }
        } catch (err) {
            setError(getErrorMessage(err, "Nepodařilo se smazat vybavení."));
        } finally {
            setProcessingId(null);
        }
    };

    return {
        equipmentList,
        isLoading,
        search,
        setSearch,
        page,
        setPage,
        totalPages,
        handleEquipmentCreated,
        handleDeleteEquipment,
        processingId,
        error,
        clearError: () => setError(null),
    };
};
