import { useState, useEffect } from "react";
import { useRoutesList } from ".././hooks/useRoutesList";
import { deleteRoute } from "../../../../services/routesApiService";
import RouteCard from ".././components/RouteCard/RouteCard";
import { Plus, LayoutGrid, Share2 } from "lucide-react"; // Icons for tabs
import { useNavigate } from "react-router-dom";
import Pagination from "../../../../components/ui/Pagination/Pagination";
import { usePagination } from "../../../../hooks/usePagination";
import "./RoutesListEditor.css";

const RoutesListEditor = () => {
    const pagination = usePagination();
    const {
        ownedRoutes,
        sharedRoutes,
        ownedPagination,
        sharedPagination,
        isLoading,
        error,
        openRoute,
        refetch
    } = useRoutesList(pagination.page);

    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'owned' | 'shared'>('owned');

    const handleCreateNew = () => {
        navigate("/routes/new");
    };

    const routesToDisplay = activeTab === 'owned' ? ownedRoutes : sharedRoutes;
    const activePagination = activeTab === 'owned' ? ownedPagination : sharedPagination;

    const handleRouteDelete = async (id: number) => {
        if (window.confirm("Opravdu chcete smazat tuto cestu? Tato akce je nevratná.")) {
            try {
                // Bylo by dobré mít isLoading state i pro mazání, ale pro jednoduchost:
                await deleteRoute(id);
                // Obnovení seznamu
                if (refetch) {
                    refetch();
                }
            } catch (err) {
                console.error("Nepodařilo se smazat cestu", err);
                // Ideálně zobrazit chybu uživateli
                alert("Nepodařilo se smazat cestu. Zkuste to prosím znovu.");
            }
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
                <h1 className="routes-list-editor-title">Moje cesty</h1>

                {/* Tabs / Switcher */}
                <div className="routes-list-editor-tabs-container">
                    <button
                        onClick={() => setActiveTab('owned')}
                        className={`routes-list-editor-tab-btn ${activeTab === 'owned' ? 'routes-list-editor-tab-active-owned' : 'routes-list-editor-tab-inactive'}`}
                    >
                        <LayoutGrid size={16} />
                        Moje cesty
                        <span className={`routes-list-editor-tab-badge ${activeTab === 'owned' ? 'routes-list-editor-tab-badge-owned-active' : 'routes-list-editor-tab-badge-inactive'}`}>
                            {ownedRoutes.length}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab('shared')}
                        className={`routes-list-editor-tab-btn ${activeTab === 'shared' ? 'routes-list-editor-tab-active-shared' : 'routes-list-editor-tab-inactive'}`}
                    >
                        <Share2 size={16} />
                        Sdílené
                        <span className={`routes-list-editor-tab-badge ${activeTab === 'shared' ? 'routes-list-editor-tab-badge-shared-active' : 'routes-list-editor-tab-badge-inactive'}`}>
                            {sharedRoutes.length}
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
        </div>
    );
};

export default RoutesListEditor;
