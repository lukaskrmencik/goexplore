import { useState, useEffect, useCallback } from "react";
import type { Route } from "../../../../types/routes";
import {
    fetchGeneralEquipment,
    fetchMyEquipment,
    deleteMyEquipment
} from "../../../../services/equipmentApiService";

import {
    addEquipmentToRoute,
    removeEquipmentFromRoute,
    fetchGetRoute
} from "../../../../services/routesApiService";
import type { GeneralEquipment, MyEquipment, EquipmentType } from "../../../../types/equipment";

export const useRouteEquipment = (route: Route, onUpdate: (route: Route) => void) => {
    // Data States
    const [generalList, setGeneralList] = useState<GeneralEquipment[]>([]);
    const [myList, setMyList] = useState<MyEquipment[]>([]);

    // UI States
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<EquipmentType>('my'); // Default to 'my' equipment
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Initial Load & Search
    const loadLists = useCallback(async (silent = false) => {
        if (!silent) setIsLoading(true);
        try {
            const [genRes, myRes] = await Promise.all([
                fetchGeneralEquipment(1, search),
                fetchMyEquipment(1, search)
            ]);
            setGeneralList(genRes.data || []);
            setMyList(myRes.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            if (!silent) setIsLoading(false);
        }
    }, [search]);

    useEffect(() => {
        const timeout = setTimeout(loadLists, 300);
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


    return {
        generalList,
        myList,
        isLoading,
        search,
        setSearch,
        activeTab,
        setActiveTab,
        handleToggleItem,
        handleEquipmentCreated,
        handleDeleteMyEquipment,
        processingId,
        error,
        clearError: () => setError(null),
    };
};
