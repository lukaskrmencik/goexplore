import { useState, useEffect } from "react";
import { useRoutesList } from ".././hooks/useRoutesList";
import { deleteRoute } from "../../../../services/routesApiService";
import RouteCard from ".././components/RouteCard/RouteCard";
import { Plus, LayoutGrid, Share2, Search } from "lucide-react"; // Icons for tabs
import { useNavigate, useSearchParams } from "react-router-dom";
import ConfirmDialog from "../../../../components/ui/ConfirmDialog/ConfirmDialog";
import { Input } from "../../../../components/ui/Input/Input";
import Pagination from "../../../../components/ui/Pagination/Pagination";
import { usePagination } from "../../../../hooks/usePagination";
import "./RoutesListEditor.css";

const RoutesListEditor = () => {
    const pagination = usePagination();
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchInput);
            if (searchInput !== debouncedSearch) {
                pagination.setPage(1);
            }
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchInput]);

    const {
        ownedRoutes,
        sharedRoutes,
        ownedPagination,
        sharedPagination,
        isLoading,
        error,
        openRoute,
        refetch
    } = useRoutesList(pagination.page, debouncedSearch);

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = (searchParams.get("tab") as 'owned' | 'shared') || 'owned';

    const setActiveTab = (tab: 'owned' | 'shared') => {
        setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev);
            newParams.set("tab", tab);
            newParams.delete("page");
            return newParams;
        });
    };
    const [routeToDelete, setRouteToDelete] = useState<number | null>(null);
    const [routeToUnjoin, setRouteToUnjoin] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleCreateNew = () => {
        navigate("/routes/new");
    };

    const routesToDisplay = activeTab === 'owned' ? ownedRoutes : sharedRoutes;
    const activePagination = activeTab === 'owned' ? ownedPagination : sharedPagination;

    const handleRouteDelete = (id: number) => {
        setRouteToDelete(id);
    };

    const handleRouteUnjoin = (id: number) => {
        setRouteToUnjoin(id);
    };

    const confirmDelete = async () => {
        if (routeToDelete === null) return;
        setIsDeleting(true);
        try {
            await deleteRoute(routeToDelete);
            if (refetch) {
                refetch();
            }
        } catch (err) {
            console.error("Nepodařilo se smazat cestu", err);
            alert("Nepodařilo se smazat cestu. Zkuste to prosím znovu.");
        } finally {
            setIsDeleting(false);
            setRouteToDelete(null);
        }
    };

    const confirmUnjoin = async () => {
        if (routeToUnjoin === null) return;
        setIsDeleting(true); // Reusing isDeleting for loading state
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Not authenticated");

            // Native JWT decode to avoid missing npm dependencies
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const decoded = JSON.parse(jsonPayload);
            const currentUserId = decoded.sub;

            // Import path needs to be resolved since deleteRoute comes from routesApiService. 
            // The file currently only imports deleteRoute, so we will use an inline dynamic import or we should add removeUserFromRoute to the main imports
            const { removeUserFromRoute } = await import("../../../../services/routesApiService");
            await removeUserFromRoute(routeToUnjoin, currentUserId);

            if (refetch) {
                refetch();
            }
        } catch (err) {
            console.error("Nepodařilo se odpojit od cesty", err);
            alert("Nepodařilo se odpojit z cesty. Zkuste to prosím znovu.");
        } finally {
            setIsDeleting(false);
            setRouteToUnjoin(null);
        }
    };

    // Scroll to top when page changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [pagination.page]);

    return (
        <div className="routes-list-editor-container">

            {/* Page Header & Filters */}
            <div className="routes-list-editor-header-wrapper">
                <h1 className="routes-list-editor-title">
                    {activeTab === 'shared' ? 'Sdílené cesty' : 'Moje cesty'}
                </h1>

                {/* Search Bar */}
                <div className="routes-list-editor-search-wrapper">
                    <Input
                        icon={Search}
                        placeholder={activeTab === 'shared' ? "Hledat ve sdílených cestách..." : "Hledat v mých cestách..."}
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                </div>

                {/* Tabs / Switcher */}
                <div className="routes-list-editor-tabs-container">
                    <button
                        onClick={() => setActiveTab('owned')}
                        className={`routes-list-editor-tab-btn ${activeTab === 'owned' ? 'routes-list-editor-tab-active-owned' : 'routes-list-editor-tab-inactive'}`}
                    >
                        <LayoutGrid size={16} />
                        Moje cesty
                        <span className={`routes-list-editor-tab-badge ${activeTab === 'owned' ? 'routes-list-editor-tab-badge-owned-active' : 'routes-list-editor-tab-badge-inactive'}`}>
                            {ownedRoutes.length ? ownedRoutes.length : ownedPagination.total_items}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab('shared')}
                        className={`routes-list-editor-tab-btn ${activeTab === 'shared' ? 'routes-list-editor-tab-active-shared' : 'routes-list-editor-tab-inactive'}`}
                    >
                        <Share2 size={16} />
                        Sdílené
                        <span className={`routes-list-editor-tab-badge ${activeTab === 'shared' ? 'routes-list-editor-tab-badge-shared-active' : 'routes-list-editor-tab-badge-inactive'}`}>
                            {sharedRoutes.length ? sharedRoutes.length : sharedPagination.total_items}
                        </span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {isLoading ? (
                <div className="routes-list-editor-skeleton-grid">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="routes-list-editor-skeleton-card"></div>
                    ))}
                </div>
            ) : error ? (
                <div className="routes-list-editor-error">
                    {error}
                </div>
            ) : (
                <div className="routes-list-editor-content-wrapper">
                    <div className="routes-list-editor-grid">

                        {/* Create New Route Card - Always visible in 'owned' tab, only on first page */}
                        {activeTab === 'owned' && pagination.page === 1 && (
                            <div
                                onClick={handleCreateNew}
                                className="routes-list-editor-create-card group"
                            >
                                <div className="routes-list-editor-create-icon-wrapper">
                                    <Plus size={32} />
                                </div>
                                <span className="routes-list-editor-create-text">
                                    Naplánovat
                                </span>
                            </div>
                        )}

                        {/* Routes Loop */}
                        {routesToDisplay.length > 0 ? (
                            routesToDisplay.map(route => (
                                <RouteCard
                                    key={route.id}
                                    route={route}
                                    onOpen={openRoute}
                                    onDelete={activeTab === 'owned' ? handleRouteDelete : undefined}
                                    onUnjoin={activeTab === 'shared' ? handleRouteUnjoin : undefined}
                                    isShared={activeTab === 'shared'}
                                />
                            ))
                        ) : (
                            // Empty State only for Shared (since 'owned' always has the Create card on page 1)
                            activeTab === 'shared' && (
                                <div className="routes-list-editor-empty-container">
                                    <div className="routes-list-editor-empty-icon-wrapper">
                                        <Share2 size={32} />
                                    </div>
                                    <div className="routes-list-editor-empty-text-wrapper">
                                        <h3 className="routes-list-editor-empty-title">
                                            Žádné sdílené cesty
                                        </h3>
                                        <p className="routes-list-editor-empty-desc">
                                            Cesty, které s vámi někdo sdílel, se objeví zde.
                                        </p>
                                    </div>
                                </div>
                            )
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {(activePagination.total_pages > 1) && (
                        <div className="routes-list-editor-pagination-wrapper">
                            <Pagination
                                currentPage={pagination.page}
                                totalPages={activePagination.total_pages}
                                onPageChange={pagination.setPage}
                            />
                        </div>
                    )}
                </div>
            )}

            <ConfirmDialog
                isOpen={routeToDelete !== null}
                title="Smazat cestu"
                description="Opravdu chcete smazat tuto cestu? Tato akce je nevratná."
                confirmLabel="Smazat"
                cancelLabel="Zrušit"
                onConfirm={confirmDelete}
                onCancel={() => setRouteToDelete(null)}
                isDestructive={true}
                isLoading={isDeleting}
            />

            <ConfirmDialog
                isOpen={routeToUnjoin !== null}
                title="Odpojit se od trasy"
                description="Opravdu se chcete odpojit od této sdílené trasy? Ztratíte k ní přístup."
                confirmLabel="Odpojit"
                cancelLabel="Zrušit"
                onConfirm={confirmUnjoin}
                onCancel={() => setRouteToUnjoin(null)}
                isDestructive={true}
                isLoading={isDeleting}
            />
        </div>
    );
};

export default RoutesListEditor;
