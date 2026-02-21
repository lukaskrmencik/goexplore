import React, { useMemo } from 'react';
import { Search, Package, User, Plus, Backpack } from "lucide-react";
import type { RouteEditorProps } from "../../../types/editor";
import { useRouteEquipment } from "./hooks/useRouteEquipment";
import EquipmentCard from "./components/EquipmentCard";
import CreateEquipmentModal from "../equipmentEditor/CreateEquipmentModal";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import Toast from "../../../components/ui/Toast";
import { ChevronUp } from "lucide-react";

const RouteEquipmentEditor: React.FC<RouteEditorProps> = ({ route, onUpdate }) => {
    const {
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
        clearError
    } = useRouteEquipment(route, onUpdate);

    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingEquipment, setEditingEquipment] = React.useState<any | null>(null);
    const [deletingId, setDeletingId] = React.useState<number | null>(null);

    // Mobile Bottom Sheet State
    const [isBackpackOpen, setIsBackpackOpen] = React.useState(false);

    // Filter Logic
    // 1. Available Items (Warehouse)
    const availableGeneral = useMemo(() => {
        // Filter out items that are already in the route? 
        // Design decision: Keep them visible but marked as added, or hide them?
        // Let's keep them visible so you can remove them from here too.
        return generalList.filter(item =>
            item.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [generalList, search]);

    const availableMy = useMemo(() => {
        return myList.filter(item =>
            item.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [myList, search]);

    // 2. Route Items (Backpack)
    const routeEquipment = useMemo(() => {
        return route.equipment || [];
    }, [route.equipment]);


    // Helper to check if item is in route
    const isItemInRoute = (type: 'general' | 'my', id: number) => {
        return routeEquipment.some(e =>
            (type === 'general' && Number(e.general_equipment_id) === Number(id)) ||
            (type === 'my' && Number(e.my_equipment_id) === Number(id))
        );
    };

    const handleEditMyEquipment = (item: any) => {
        setEditingEquipment(item);
        setIsModalOpen(true);
    };

    const handleCreateNew = () => {
        setEditingEquipment(null);
        setIsModalOpen(true);
    };

    return (
        <div className="w-full h-full flex flex-col md:flex-row bg-slate-50 relative overflow-hidden">

            {/* --- BACKDROP (Mobile Only) --- */}
            {isBackpackOpen && (
                <div
                    className="absolute inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden transition-opacity"
                    onClick={() => setIsBackpackOpen(false)}
                />
            )}

            {/* --- LEFT PANEL: BACKPACK (Route Equipment) --- */}
            <div className={`
                absolute md:static inset-x-0 bottom-0 top-auto z-40
                flex flex-col
                bg-white md:bg-white
                border-t border-slate-200 md:border-none md:border-r md:border-r-slate-200
                rounded-t-[32px] md:rounded-none
                shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] md:shadow-none
                transition-all duration-500 cubic-bezier(0.32, 0.72, 0, 1)
                ${isBackpackOpen ? 'h-[90%] translate-y-0' : 'h-24 translate-y-0'}
                md:h-auto md:w-1/3 md:translate-y-0
            `}>
                {/* Drag Handle / Header (Mobile Toggle) */}
                <div
                    className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur-xl sticky top-0 z-10 rounded-t-[32px] md:rounded-none cursor-pointer md:cursor-default h-24 md:h-auto pb-8 md:pb-6"
                    onClick={() => setIsBackpackOpen(!isBackpackOpen)}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg shrink-0">
                            <Backpack size={24} />
                        </div>
                        <div>
                            <h2 className="font-heading font-bold text-slate-900 text-xl flex items-center gap-2">
                                Batoh
                                <ChevronUp size={20} className={`text-slate-400 md:hidden transition-transform duration-300 ${isBackpackOpen ? 'rotate-180' : ''}`} />
                            </h2>
                            <p className="text-xs text-slate-500 font-bold">
                                {routeEquipment.length} položek
                                {!isBackpackOpen && <span className="md:hidden font-normal text-slate-400 ml-1">(Klikni pro otevření)</span>}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/50 pb-8 md:pb-4">
                    {routeEquipment.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center opacity-60">
                            <Backpack size={48} strokeWidth={1.5} className="mb-4" />
                            <p>Tvůj batoh je zatím prázdný.</p>
                            <button
                                onClick={() => setIsBackpackOpen(false)}
                                className="mt-4 text-emerald-600 text-sm font-bold hover:underline md:hidden"
                            >
                                Přidat vybavení
                            </button>
                        </div>
                    ) : (
                        routeEquipment.map((item) => {
                            const isMy = !!item.my_equipment_id;

                            // Prefer loaded nested relations from RouteController
                            // If it's My Equipment
                            let displayItem: any = null;

                            if (isMy && item.my_equipment) {
                                displayItem = item.my_equipment;
                            }
                            // If it's General Equipment
                            else if (!isMy && item.general_equipment) {
                                displayItem = item.general_equipment;
                            }
                            // Fallback to list lookup (legacy/cache)
                            else if (isMy) {
                                displayItem = myList.find(m => m.id === item.my_equipment_id);
                            } else {
                                displayItem = generalList.find(g => g.id === item.general_equipment_id);
                            }

                            // Ultimate fallback
                            if (!displayItem) {
                                displayItem = {
                                    id: isMy ? item.my_equipment_id! : item.general_equipment_id!,
                                    name: item.name || "Unknown Item",
                                    img: null,
                                    specifications: {}
                                };
                            }

                            return (
                                <EquipmentCard
                                    key={item.id} // Use pivot ID
                                    item={displayItem}
                                    type={isMy ? 'my' : 'general'}
                                    isAdded={true}
                                    isProcessing={processingId === (isMy ? item.my_equipment_id : item.general_equipment_id)}
                                    onToggle={(t, id, _) => handleToggleItem(t, id, true)}
                                    variant="compact"
                                />
                            );
                        })
                    )}
                </div>

                {/* Mobile Bottom Bar Placeholder (removed) */}
            </div>


            {/* --- RIGHT PANEL: WAREHOUSE (Available Equipment) --- */}
            <div className="flex-1 flex flex-col bg-slate-50 relative pb-0 overflow-hidden">

                {/* Header & Search */}
                <div className="p-3 md:p-6 pb-2 space-y-2 md:space-y-4 bg-white/80 backdrop-blur-xl border-b border-slate-200 z-10 sticky top-0">
                    <div className="flex items-center justify-between md:block hidden">
                        <h2 className="font-heading font-bold text-slate-900 text-xl md:text-2xl">Vyber vybavení</h2>
                    </div>

                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Hledat vybavení..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 md:pl-10 pr-4 py-2 md:py-3 text-sm md:text-base rounded-xl bg-white border border-slate-200 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                            />
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex p-1 bg-slate-100 rounded-xl">
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`flex-1 flex items-center justify-center gap-2 py-1.5 md:py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all ${activeTab === 'general'
                                ? 'bg-white text-emerald-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <Package size={16} className="md:w-[18px] md:h-[18px]" />
                            <span className="hidden sm:inline">Katalog</span>
                            <span className="sm:hidden">Katalog</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('my')}
                            className={`flex-1 flex items-center justify-center gap-2 py-1.5 md:py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all ${activeTab === 'my'
                                ? 'bg-white text-emerald-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <User size={16} className="md:w-[18px] md:h-[18px]" />
                            <span className="hidden sm:inline">Moje vybavení</span>
                            <span className="sm:hidden">Moje</span>
                        </button>
                    </div>
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto p-3 md:p-4 pb-24 md:pb-6 bg-slate-50">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400 animate-pulse">
                            <Package size={48} className="mb-4 opacity-20" />
                            <span className="font-bold">Načítám sklad...</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-min">
                            {/* Create Button (Only for My Equipment) */}
                            {activeTab === 'my' && (
                                <button
                                    onClick={handleCreateNew}
                                    className="flex flex-row md:flex-col items-center justify-center md:justify-center p-4 md:p-6 gap-3 md:gap-3 border-2 border-dashed border-slate-300 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50/50 text-slate-400 hover:text-emerald-600 transition-all group w-full bg-white/50 h-auto min-h-0 md:h-full md:min-h-[200px]"
                                >
                                    <div className="h-10 w-10 md:h-12 md:w-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                                        <Plus size={20} className="md:w-6 md:h-6" />
                                    </div>
                                    <div className="text-left md:text-center">
                                        <span className="font-heading font-bold text-sm block text-slate-900 group-hover:text-emerald-700">Vytvořit vlastní</span>
                                        <span className="text-xs font-medium opacity-70 hidden md:block">Přidat nové vybavení</span>
                                    </div>
                                </button>
                            )}

                            {activeTab === 'general' ? (
                                availableGeneral.map(item => (
                                    <EquipmentCard
                                        key={item.id}
                                        item={item}
                                        type="general"
                                        isAdded={isItemInRoute('general', item.id)}
                                        isProcessing={processingId === item.id}
                                        onToggle={handleToggleItem}
                                        variant="standard"
                                    />
                                ))
                            ) : (
                                availableMy.map(item => (
                                    <EquipmentCard
                                        key={item.id}
                                        item={item}
                                        type="my"
                                        isAdded={isItemInRoute('my', item.id)}
                                        isProcessing={processingId === item.id}
                                        onToggle={handleToggleItem}
                                        onDelete={(id) => setDeletingId(id)}
                                        onEdit={() => handleEditMyEquipment(item)}
                                        variant="standard"
                                    />
                                ))
                            )}

                            {/* Empty States */}
                            {activeTab === 'general' && availableGeneral.length === 0 && (
                                <div className="col-span-full py-12 text-center text-slate-500 flex flex-col items-center opacity-60">
                                    <Search size={48} strokeWidth={1} className="mb-4 text-slate-300" />
                                    <p>Žádné vybavení v katalogu nenalezeno.</p>
                                </div>
                            )}
                            {activeTab === 'my' && availableMy.length === 0 && !search && (
                                <div className="col-span-full py-12 text-center text-slate-400 text-sm flex flex-col items-center justify-center opacity-60">
                                    <User size={48} strokeWidth={1} className="mb-4 text-slate-300" />
                                    <p>Zatím nemáš žádné vlastní vybavení.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Mobile Bottom Navigation Bar (Removed - using Bottom Sheet instead) */}

                {/* Warning/Info Toast Placeholder */}
                {error && <Toast message={error} onClose={clearError} />}
            </div>

            {/* Create Modal */}
            <CreateEquipmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={editingEquipment}
                onSubmit={(newEquipment) => {
                    handleEquipmentCreated(newEquipment);
                    setIsModalOpen(false);
                }}
            />

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                isOpen={!!deletingId}
                title="Smazat vybavení?"
                description="Tato akce je nevratná. Vybavení bude odebráno ze všech tras a trvale smazáno."
                confirmLabel="Smazat"
                isDestructive={true}
                onConfirm={async () => {
                    if (deletingId) {
                        await handleDeleteMyEquipment(deletingId);
                        setDeletingId(null);
                    }
                }}
                onCancel={() => setDeletingId(null)}
                isLoading={processingId === deletingId}
            />

        </div>
    );
};

export default RouteEquipmentEditor;
