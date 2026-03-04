import { useState, useEffect } from "react";
import { useRoutesList } from "./hooks/useRoutesList";
import RouteCard from "./components/RouteCard";
import { Plus, LayoutGrid, Share2 } from "lucide-react"; // Icons for tabs
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import Pagination from "../../../components/ui/Pagination";
import { usePagination } from "../../../hooks/usePagination";

const RoutesListEditor = () => {
    const pagination = usePagination();
    const {
        ownedRoutes,
        sharedRoutes,
        ownedPagination,
        sharedPagination,
        isLoading,
        error,
        openRoute
    } = useRoutesList(pagination.page);

    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'owned' | 'shared'>('owned');

    const handleCreateNew = () => {
        navigate("/routes/new");
    };

    const routesToDisplay = activeTab === 'owned' ? ownedRoutes : sharedRoutes;
    const activePagination = activeTab === 'owned' ? ownedPagination : sharedPagination;

    // Scroll to top when page changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [pagination.page]);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

            {/* Page Header & Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <h1 className="text-3xl font-heading font-bold text-slate-900">Moje cesty</h1>

                {/* Tabs / Switcher */}
                <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
                    <button
                        onClick={() => setActiveTab('owned')}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all
                            ${activeTab === 'owned'
                                ? 'bg-white text-emerald-700 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'}
                        `}
                    >
                        <LayoutGrid size={16} />
                        Moje cesty
                        <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${activeTab === 'owned' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                            {ownedRoutes.length}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab('shared')}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all
                            ${activeTab === 'shared'
                                ? 'bg-white text-indigo-700 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'}
                        `}
                    >
                        <Share2 size={16} />
                        Sdílené trasy
                        <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${activeTab === 'shared' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'}`}>
                            {sharedRoutes.length}
                        </span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="aspect-[4/3] bg-slate-200 rounded-2xl"></div>
                    ))}
                </div>
            ) : error ? (
                <div className="p-8 rounded-2xl bg-rose-50 border border-rose-100 text-center text-rose-600 font-bold">
                    {error}
                </div>
            ) : (
                <div className="space-y-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                        {/* Create New Route Card - Always visible in 'owned' tab, only on first page */}
                        {activeTab === 'owned' && pagination.page === 1 && (
                            <div
                                onClick={handleCreateNew}
                                className="group h-full min-h-[280px] rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/30 hover:bg-emerald-50/50 hover:border-emerald-600 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-4"
                            >
                                <div className="w-16 h-16 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-emerald-600 group-hover:scale-110 group-hover:text-emerald-700 transition-transform duration-300">
                                    <Plus size={32} />
                                </div>
                                <span className="font-heading font-bold text-slate-700 text-lg group-hover:text-emerald-700 transition-colors">
                                    Nová trasa
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
                                    isShared={activeTab === 'shared'}
                                />
                            ))
                        ) : (
                            // Empty State only for Shared (since 'owned' always has the Create card on page 1)
                            activeTab === 'shared' && (
                                <div className="col-span-full py-20 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-4 text-center">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                                        <Share2 size={32} />
                                    </div>
                                    <div className="max-w-xs">
                                        <h3 className="text-slate-900 font-bold text-lg mb-1">
                                            Žádné sdílené cesty
                                        </h3>
                                        <p className="text-slate-500 text-sm">
                                            Cesty, které s vámi někdo sdílel, se objeví zde.
                                        </p>
                                    </div>
                                </div>
                            )
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {(activePagination.total_pages > 1) && (
                        <div className="flex justify-center pt-4 border-t border-slate-100">
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
