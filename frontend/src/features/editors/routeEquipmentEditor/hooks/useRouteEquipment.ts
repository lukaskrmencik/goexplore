import { useState, useEffect, useCallback, useMemo } from "react";
import type { Route } from "../../../../types/routes";
import type { GeneralEquipment, MyEquipment, EquipmentType } from "../../../../types/equipment";
import type { User } from "../../../../types/users";
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
import { fetchMyUser } from "../../../../services/usersApiService";
import { getErrorMessage } from "../../../../utils/apiError";

const PER_PAGE = Number(import.meta.env.VITE_EQUIPMENT_PER_PAGE ?? "12");
const EQUIPMENT_SEARCH_DEBOUNCE = Number(import.meta.env.VITE_EQUIPMENT_SEARCH_DEBOUNCE ?? "300");

export interface ResolvedBackpackItem {
    pivotId: number;
    displayItem: GeneralEquipment | MyEquipment;
    equipmentType: EquipmentType;
    equipmentId: number;
}

function resolveBackpackItemDisplay(
    item: NonNullable<Route['equipment']>[0],
    myList: MyEquipment[],
    generalList: GeneralEquipment[]
): GeneralEquipment | MyEquipment {
    const isMy = !!item.my_equipment_id;

    if (isMy && item.my_equipment) return item.my_equipment as MyEquipment;
    if (!isMy && item.general_equipment) return item.general_equipment as GeneralEquipment;
    if (isMy) {
        const found = myList.find(m => m.id === item.my_equipment_id);
        if (found) return found;
    } else {
        const found = generalList.find(g => g.id === item.general_equipment_id);
        if (found) return found;
    }

    const fallbackId = isMy ? item.my_equipment_id! : item.general_equipment_id!;
    return {
        id: fallbackId,
        name: item.name || "Unknown Item",
        img: null,
        specifications: {},
        general_specifications: {},
        created_at: null,
        updated_at: null,
    } as GeneralEquipment;
}

export const useRouteEquipment = (route: Route, onUpdate: (route: Route) => void) => {
    const [generalList, setGeneralList] = useState<GeneralEquipment[]>([]);
    const [myList, setMyList] = useState<MyEquipment[]>([]);
    const [generalMeta, setGeneralMeta] = useState({ page: 1, total_pages: 1, total_items: 0 });
    const [myMeta, setMyMeta] = useState({ page: 1, total_pages: 1, total_items: 0 });

    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [generalPage, setGeneralPage] = useState(1);
    const [myPage, setMyPage] = useState(1);
    const [activeTab, setActiveTab] = useState<EquipmentType>('my');
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        fetchMyUser()
            .then(user => setCurrentUser(user))
            .catch(err => console.error(err));
    }, []);

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

    const handleToggleItem = async (type: EquipmentType, id: number, isCurrentlyAdded: boolean) => {
        setProcessingId(id);
        setError(null);
        try {
            if (isCurrentlyAdded) {
                await removeEquipmentFromRoute(route.id, type, id);
            } else {
                await addEquipmentToRoute(route.id, type, id);
            }
            const updatedRoute = await fetchGetRoute(route.id);
            onUpdate(updatedRoute);
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err, "Akce se nezdařila."));
        } finally {
            setProcessingId(null);
        }
    };

    const handleEquipmentCreated = async (newEquipment: MyEquipment) => {
        setError(null);
        try {
            await loadLists();
            const isAlreadyInRoute = route.equipment?.some(e => Number(e.my_equipment_id) === Number(newEquipment.id));
            if (!isAlreadyInRoute) {
                await handleToggleItem('my', newEquipment.id, false);
            } else {
                const updatedRoute = await fetchGetRoute(route.id);
                onUpdate(updatedRoute);
            }
        } catch (err) {
            console.error(err);
            setError("Nepodařilo se přidat nové vybavení do trasy.");
        }
    };

    const handleDeleteMyEquipment = async (id: number) => {
        setProcessingId(id);
        try {
            await deleteMyEquipment(id);
            await loadLists(true);
            const updatedRoute = await fetchGetRoute(route.id);
            onUpdate(updatedRoute);
        } catch (err) {
            setError(getErrorMessage(err, "Smazání se nezdařilo."));
        } finally {
            setProcessingId(null);
        }
    };

    const availableGeneral = useMemo(() =>
        generalList.filter(item => item.name.toLowerCase().includes(search.toLowerCase())),
        [generalList, search]
    );

    const availableMy = useMemo(() =>
        myList.filter(item => item.name.toLowerCase().includes(search.toLowerCase())),
        [myList, search]
    );

    const isItemInRoute = (type: EquipmentType, id: number): boolean => {
        return (route.equipment || []).some(e =>
            (type === 'general' && Number(e.general_equipment_id) === Number(id)) ||
            (type === 'my' && Number(e.my_equipment_id) === Number(id))
        );
    };

    const resolvedBackpackItems: ResolvedBackpackItem[] = useMemo(() =>
        (route.equipment || []).map(item => {
            const isMy = !!item.my_equipment_id;
            const equipmentType: EquipmentType = isMy ? 'my' : 'general';
            const equipmentId = isMy ? item.my_equipment_id! : item.general_equipment_id!;
            return {
                pivotId: item.id,
                displayItem: resolveBackpackItemDisplay(item, myList, generalList),
                equipmentType,
                equipmentId,
            };
        }),
        [route.equipment, myList, generalList]
    );

    const currentPage = activeTab === 'general' ? generalPage : myPage;
    const setCurrentPage = activeTab === 'general' ? setGeneralPage : setMyPage;
    const totalPages = activeTab === 'general' ? generalMeta.total_pages : myMeta.total_pages;

    return {
        availableGeneral,
        availableMy,
        resolvedBackpackItems,
        isLoading,
        search,
        setSearch,
        activeTab,
        setActiveTab,
        currentPage,
        setCurrentPage,
        totalPages,
        isItemInRoute,
        handleToggleItem,
        handleEquipmentCreated,
        handleDeleteMyEquipment,
        processingId,
        currentUser,
        error,
        clearError: () => setError(null),
    };
};
