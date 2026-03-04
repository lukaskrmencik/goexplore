import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useRoutesList } from "../hooks/useRoutesList";
import { useRouteActions } from "../hooks/useRouteActions";
import { usePagination } from "../../../../hooks/usePagination";
import RoutesPageHeader from "../components/RoutesPageHeader/RoutesPageHeader";
import RoutesGrid from "../components/RoutesGrid/RoutesGrid";
import ConfirmDialog from "../../../../components/ui/ConfirmDialog/ConfirmDialog";
import "./RoutesListEditor.css";

const ROUTES_SEARCH_DEBOUNCE_MS = Number(import.meta.env.VITE_LOCATION_SEARCH_DEBOUNCE ?? "500");

const RoutesListEditor = () => {
    const pagination = usePagination();
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const activeTab = (searchParams.get("tab") as "owned" | "shared") || "owned";

    const setActiveTab = (tab: "owned" | "shared") => {
        setSearchParams(prev => {
            const params = new URLSearchParams(prev);
            params.set("tab", tab);
            params.delete("page");
            return params;
        });
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchInput);
            pagination.setPage(1);
        }, ROUTES_SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(handler);
    }, [searchInput]);

    const { ownedRoutes, sharedRoutes, ownedPagination, sharedPagination, isLoading, error, refetch } =
        useRoutesList(pagination.page, debouncedSearch);

    const routeActions = useRouteActions(refetch);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [pagination.page]);

    const visibleRoutes = activeTab === "owned" ? ownedRoutes : sharedRoutes;
    const activePagination = activeTab === "owned" ? ownedPagination : sharedPagination;

    return (
        <div className="routes-list-editor-container">
            <RoutesPageHeader
                activeTab={activeTab}
                onTabChange={setActiveTab}
                searchValue={searchInput}
                onSearchChange={setSearchInput}
                ownedCount={ownedRoutes.length || ownedPagination.total_items}
                sharedCount={sharedRoutes.length || sharedPagination.total_items}
            />

            <RoutesGrid
                isLoading={isLoading}
                error={error}
                activeTab={activeTab}
                routes={visibleRoutes}
                currentPage={pagination.page}
                totalPages={activePagination.total_pages}
                onPageChange={pagination.setPage}
                onDeleteRoute={routeActions.requestDelete}
                onUnjoinRoute={routeActions.requestUnjoin}
            />

            <ConfirmDialog
                isOpen={routeActions.routeIdToDelete !== null}
                title="Smazat trasu"
                description="Opravdu chcete smazat tuto trasu? Tato akce je nevratná."
                confirmLabel="Smazat"
                cancelLabel="Zrušit"
                onConfirm={routeActions.confirmDelete}
                onCancel={routeActions.cancelDelete}
                isDestructive={true}
                isLoading={routeActions.isProcessing}
            />

            <ConfirmDialog
                isOpen={routeActions.routeIdToUnjoin !== null}
                title="Odpojit se od trasy"
                description="Opravdu se chcete odpojit od této sdílené trasy? Ztratíte k ní přístup."
                confirmLabel="Odpojit"
                cancelLabel="Zrušit"
                onConfirm={routeActions.confirmUnjoin}
                onCancel={routeActions.cancelUnjoin}
                isDestructive={true}
                isLoading={routeActions.isProcessing}
            />
        </div>
    );
};

export default RoutesListEditor;
