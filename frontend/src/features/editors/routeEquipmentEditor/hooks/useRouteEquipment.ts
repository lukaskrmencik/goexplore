import { useState, useEffect, useCallback } from "react";
import type { Route } from "../../../../types/routes";
import {
    fetchGeneralEquipment,
    deleteMyEquipment
} from "../../../../services/equipmentApiService";

import {
    addEquipmentToRoute,
    removeEquipmentFromRoute,
    fetchGetRoute,
    fetchAvailableRouteEquipment
} from "../../../../services/routesApiService";
import type { GeneralEquipment, MyEquipment, EquipmentType } from "../../../../types/equipment";

const PER_PAGE = Number(import.meta.env.VITE_EQUIPMENT_PER_PAGE ?? "12");
const EQUIPMENT_SEARCH_DEBOUNCE = Number(import.meta.env.VITE_EQUIPMENT_SEARCH_DEBOUNCE ?? "300");

export const useRouteEquipment = (route: Route, onUpdate: (route: Route) => void) => {
    // Data States
    const [generalList, setGeneralList] = useState<GeneralEquipment[]>([]);
    const [myList, setMyList] = useState<MyEquipment[]>([]);
    const [generalMeta, setGeneralMeta] = useState<{ page: number; total_pages: number; total_items: number }>({ page: 1, total_pages: 1, total_items: 0 });
    const [myMeta, setMyMeta] = useState<{ page: number; total_pages: number; total_items: number }>({ page: 1, total_pages: 1, total_items: 0 });

    // UI States
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [generalPage, setGeneralPage] = useState(1);
    const [myPage, setMyPage] = useState(1);
    const [activeTab, setActiveTab] = useState<EquipmentType>('my');
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Load current tab's list with pagination
    const loadLists = useCallback(async (silent = false) => {
        if (!silent) setIsLoading(true);
        try {
            const [genRes, myRes] = await Promise.all([
                fetchGeneralEquipment(generalPage, search, PER_PAGE),
                fetchAvailableRouteEquipment(route.id, myPage, search, PER_PAGE)
            ]);
            setGeneralList(genRes.data || []);
            setMyList(myRes.data || []);
            if (genRes.meta) {
                setGeneralMeta({
                    page: genRes.meta.page ?? 1,
                    total_pages: genRes.meta.total_pages ?? 1,
                    total_items: genRes.meta.total_items ?? 0
                });
            }
            if (myRes.meta) {
                setMyMeta({
                    page: myRes.meta.page ?? 1,
                    total_pages: myRes.meta.total_pages ?? 1,
                    total_items: myRes.meta.total_items ?? 0
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            if (!silent) setIsLoading(false);
        }
    }, [search, route.id, generalPage, myPage]);

    useEffect(() => {
        setGeneralPage(1);
        setMyPage(1);
    }, [search]);

    useEffect(() => {
        const timeout = setTimeout(loadLists, EQUIPMENT_SEARCH_DEBOUNCE);
        return () => clearTimeout(timeout);
    }, [loadLists]);

    // Add/Remove from Route
    const handleToggleItem = async (type: EquipmentType, id: number, isCurrentlyAdded: boolean) => {
        setProcessingId(id);
        setError(null);
        try {
            if (isCurrentlyAdded) {
                await removeEquipmentFromRoute(route.id, type, id);
            } else {
                await addEquipmentToRoute(route.id, type, id);
            }

            // Re-fetch route to get updated equipment list
            // We need to import fetchGetRoute! It was missing in the simplified replacement?
            // Wait, I laid out imports. Let's check imports.
            // If fetchGetRoute is missing, I need to add it.
            // And use it.
            const updatedRoute = await fetchGetRoute(route.id);
            onUpdate(updatedRoute);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Akce se nezdařila.");
        } finally {
            setProcessingId(null);
        }
    };

    // Handle Created Equipment (from Modal)
    const handleEquipmentCreated = async (newEquipment: MyEquipment) => {
        setError(null);
        try {
            // 1. Refresh "My Equipment" list to ensure it's up to date
            await loadLists();

            // 2. Check if it's already in the route
            const isAlreadyInRoute = route.equipment?.some(e => Number(e.my_equipment_id) === Number(newEquipment.id));

            if (!isAlreadyInRoute) {
                // 3. Automatically add to the current route if not present
                await handleToggleItem('my', newEquipment.id, false);
            } else {
                // If already in route, we still want to refresh the route to show updated details
                // handleToggleItem does this, but since we skip it, we must do it manually here.
                const updatedRoute = await fetchGetRoute(route.id);
                onUpdate(updatedRoute);
            }

            return true;
        } catch (err: any) {
            console.error(err);
            setError("Nepodařilo se přidat nové vybavení do trasy.");
            return false;
        }
    };

    // Delete Custom Equipment (Generic)
    const handleDeleteMyEquipment = async (id: number) => {
        // Confirmation is now handled by UI (ConfirmDialog)

        setProcessingId(id);
        try {
            await deleteMyEquipment(id);
            await loadLists(true); // Silent reload of available list

            // Refresh route data to remove the deleted item from the backpack
            const updatedRoute = await fetchGetRoute(route.id);
            onUpdate(updatedRoute);
        } catch (err: any) {
            setError(err.response?.data?.message || "Smazání se nezdařilo.");
        } finally {
            setProcessingId(null);
        }
    }


    const currentPage = activeTab === 'general' ? generalPage : myPage;
    const setCurrentPage = activeTab === 'general' ? setGeneralPage : setMyPage;
    const totalPages = activeTab === 'general' ? generalMeta.total_pages : myMeta.total_pages;

    return {
        generalList,
        myList,
        isLoading,
        search,
        setSearch,
        activeTab,
        setActiveTab,
        generalPage,
        myPage,
        setGeneralPage,
        setMyPage,
        currentPage,
        setCurrentPage,
        totalPages,
        generalMeta,
        myMeta,
        handleToggleItem,
        handleEquipmentCreated,
        handleDeleteMyEquipment,
        processingId,
        error,
        clearError: () => setError(null),
    };
};
