import { Plus, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { RouteItem } from "../../../../../types/routes";
import RouteCard from "../RouteCard/RouteCard";
import Pagination from "../../../../../components/ui/Pagination/Pagination";

interface RoutesGridProps {
    isLoading: boolean;
    error: string | null;
    activeTab: "owned" | "shared";
    routes: RouteItem[];
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onDeleteRoute: (id: number) => void;
    onUnjoinRoute: (id: number) => void;
}

const RoutesGrid: React.FC<RoutesGridProps> = ({
    isLoading,
    error,
    activeTab,
    routes,
    currentPage,
    totalPages,
    onPageChange,
    onDeleteRoute,
    onUnjoinRoute,
}) => {
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <div className="routes-list-editor-skeleton-grid">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="routes-list-editor-skeleton-card" />
                ))}
            </div>
        );
    }

    if (error) {
        return <div className="routes-list-editor-error">{error}</div>;
    }

    return (
        <div className="routes-list-editor-content-wrapper">
            <div className="routes-list-editor-grid">
                {activeTab === "owned" && currentPage === 1 && (
                    <div
                        onClick={() => navigate("/routes/new")}
                        className="routes-list-editor-create-card group"
                    >
                        <div className="routes-list-editor-create-icon-wrapper">
                            <Plus size={32} />
                        </div>
                        <span className="routes-list-editor-create-text">Naplánovat</span>
                    </div>
                )}

                {routes.length > 0 ? (
                    routes.map(route => (
                        <RouteCard
                            key={route.id}
                            route={route}
                            isShared={activeTab === "shared"}
                            onDelete={activeTab === "owned" ? onDeleteRoute : undefined}
                            onUnjoin={activeTab === "shared" ? onUnjoinRoute : undefined}
                        />
                    ))
                ) : (
                    activeTab === "shared" && (
                        <div className="routes-list-editor-empty-container">
                            <div className="routes-list-editor-empty-icon-wrapper">
                                <Share2 size={32} />
                            </div>
                            <div className="routes-list-editor-empty-text-wrapper">
                                <h3 className="routes-list-editor-empty-title">Žádné sdílené cesty</h3>
                                <p className="routes-list-editor-empty-desc">Cesty, které s vámi někdo sdílel, se objeví zde.</p>
                            </div>
                        </div>
                    )
                )}
            </div>

            {totalPages > 1 && (
                <div className="routes-list-editor-pagination-wrapper">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={onPageChange}
                    />
                </div>
            )}
        </div>
    );
};

export default RoutesGrid;
