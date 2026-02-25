import { useState, useEffect, useCallback } from 'react';
import { fetchMyEquipment, deleteMyEquipment } from '../../../../services/equipmentApiService';
import type { MyEquipment } from '../../../../types/equipment';
import { useDebounce } from '../../../../hooks/useDebounce';

const EQUIPMENT_SEARCH_DEBOUNCE = Number(import.meta.env.VITE_EQUIPMENT_SEARCH_DEBOUNCE ?? "300");

export const useEquipment = () => {
    const [equipmentList, setEquipmentList] = useState<MyEquipment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [processingId, setProcessingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const debouncedSearch = useDebounce(search, EQUIPMENT_SEARCH_DEBOUNCE);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    const loadEquipment = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data, meta } = await fetchMyEquipment(page, debouncedSearch);
            setEquipmentList(data || []);
            setTotalPages(meta?.last_page || 1);
        } catch (err: any) {
            console.error("Hledání vybavení se nezdařilo", err);
            setError("Nepodařilo se načíst vybavení.");
        } finally {
            setIsLoading(false);
        }
    }, [page, debouncedSearch]);

    // Re-fetch when page or debounced search changes
    useEffect(() => {
        loadEquipment();
    }, [loadEquipment]);

    const handleEquipmentCreated = () => {
        // If we are on page 1 and no search (or search matches), prepending is nice.
        // But the simplest is just to reload the current page.
        loadEquipment();
    };

    const handleDeleteEquipment = async (id: number) => {
        setProcessingId(id);
        setError(null);
        try {
            await deleteMyEquipment(id);
            setEquipmentList(prev => prev.filter(item => item.id !== id));
            // Edge case: if last item on page deleted, go back a page
            if (equipmentList.length === 1 && page > 1) {
                setPage(p => p - 1);
            }
        } catch (err: any) {
            console.error("Chyba při mazání vybavení", err);
            setError(err?.response?.data?.message || err.message || "Nepodařilo se smazat vybavení.");
        } finally {
            setProcessingId(null);
        }
    };

    const clearError = () => setError(null);

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
        clearError,
        reload: loadEquipment
    };
};
