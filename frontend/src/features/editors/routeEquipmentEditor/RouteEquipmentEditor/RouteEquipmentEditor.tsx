import React, { useMemo } from 'react';
import { Search, Package, User, Plus, Backpack } from "lucide-react";
import type { RouteEditorProps } from "../../../../types/editor";
import { useRouteEquipment } from ".././hooks/useRouteEquipment";
import EquipmentCard from ".././components/EquipmentCard/EquipmentCard";
import CreateEquipmentModal from "../../equipmentEditor/CreateEquipmentModal/CreateEquipmentModal";
import ConfirmDialog from "../../../../components/ui/ConfirmDialog/ConfirmDialog";
import Toast from "../../../../components/ui/Toast/Toast";
import { ChevronUp, X } from "lucide-react";
import "./RouteEquipmentEditor.css";

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
        <div className="route-equipment-editor-container">

            {/* --- BACKDROP (Mobile Only) --- */}
            {isBackpackOpen && (
                <div
                    className="route-equipment-editor-backdrop"
                    onClick={() => setIsBackpackOpen(false)}
                />
            )}

            {/* --- LEFT PANEL: BACKPACK (Route Equipment) --- */}
            <div className={`route-equipment-editor-backpack-panel ${isBackpackOpen ? 'route-equipment-editor-backpack-open' : 'route-equipment-editor-backpack-closed'}`}>
                {/* Drag Handle / Header (Mobile Toggle) */}
                <div
                    className="route-equipment-editor-backpack-header"
                    onClick={() => setIsBackpackOpen(!isBackpackOpen)}
                >
                    <div className="route-equipment-editor-backpack-header-content">
                        <div className="route-equipment-editor-backpack-icon-wrapper">
                            <Backpack size={24} />
                        </div>
                        <div>
                            <h2 className="route-equipment-editor-backpack-title">
                                Batoh
                                <ChevronUp size={20} className={`route-equipment-editor-chevron ${isBackpackOpen ? 'route-equipment-editor-chevron-open' : ''}`} />
                            </h2>
                            <p className="route-equipment-editor-backpack-subtitle">
                                {routeEquipment.length} položek
                                {!isBackpackOpen && <span className="route-equipment-editor-backpack-hint">(Klikni pro otevření)</span>}
                            </p>
                        </div>
                    </div>
                    {isBackpackOpen && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsBackpackOpen(false);
                            }}
                            className="route-equipment-editor-backpack-close-btn"
                        >
                            <X size={24} />
                        </button>
                    )}
                </div>

                <div className="route-equipment-editor-backpack-list">
                    {routeEquipment.length === 0 ? (
                        <div className="route-equipment-editor-backpack-empty">
                            <Backpack size={48} strokeWidth={1.5} className="route-equipment-editor-backpack-empty-icon" />
                            <p>Tvůj batoh je zatím prázdný.</p>
                            <button
                                onClick={() => setIsBackpackOpen(false)}
                                className="route-equipment-editor-backpack-add-btn"
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
            </div>


            {/* --- RIGHT PANEL: WAREHOUSE (Available Equipment) --- */}
            <div className="route-equipment-editor-warehouse-panel">

                {/* Header & Search */}
                <div className="route-equipment-editor-warehouse-header">
                    <div className="route-equipment-editor-warehouse-title-row">
                        <h2 className="route-equipment-editor-warehouse-title">Vyber vybavení</h2>
                    </div>

                    <div className="route-equipment-editor-search-row">
                        <div className="route-equipment-editor-search-wrapper">
                            <Search className="route-equipment-editor-search-icon" size={18} />
                            <input
                                type="text"
                                placeholder="Hledat vybavení..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="route-equipment-editor-search-input"
                            />
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="route-equipment-editor-tabs">
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`route-equipment-editor-tab-btn ${activeTab === 'general'
                                ? 'route-equipment-editor-tab-active'
                                : 'route-equipment-editor-tab-inactive'
                                }`}
                        >
                            <Package size={16} className="route-equipment-editor-tab-icon" />
                            <span className="route-equipment-editor-tab-text-desktop">Katalog</span>
                            <span className="route-equipment-editor-tab-text-mobile">Katalog</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('my')}
                            className={`route-equipment-editor-tab-btn ${activeTab === 'my'
                                ? 'route-equipment-editor-tab-active'
                                : 'route-equipment-editor-tab-inactive'
                                }`}
                        >
                            <User size={16} className="route-equipment-editor-tab-icon" />
                            <span className="route-equipment-editor-tab-text-desktop">Moje vybavení</span>
                            <span className="route-equipment-editor-tab-text-mobile">Moje</span>
                        </button>
                    </div>
                </div>

                {/* List Content */}
                <div className="route-equipment-editor-warehouse-list">
                    {isLoading ? (
                        <div className="route-equipment-editor-loading">
                            <Package size={48} className="route-equipment-editor-loading-icon" />
                            <span style={{ fontWeight: 700 }}>Načítám sklad...</span>
                        </div>
                    ) : (
                        <div className="route-equipment-editor-grid">
                            {/* Create Button (Only for My Equipment) */}
                            {activeTab === 'my' && (
                                <button
                                    onClick={handleCreateNew}
                                    className="route-equipment-editor-create-btn"
                                >
                                    <div className="route-equipment-editor-create-btn-icon-wrapper">
                                        <Plus size={20} className="route-equipment-editor-create-btn-icon" />
                                    </div>
                                    <div className="route-equipment-editor-create-btn-text-container">
                                        <span className="route-equipment-editor-create-btn-title">Vytvořit vlastní</span>
                                        <span className="route-equipment-editor-create-btn-subtitle">Přidat nové vybavení</span>
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
                                <div className="route-equipment-editor-empty-state route-equipment-editor-empty-state-general">
                                    <Search size={48} strokeWidth={1} className="route-equipment-editor-empty-icon" />
                                    <p>Žádné vybavení v katalogu nenalezeno.</p>
                                </div>
                            )}
                            {activeTab === 'my' && availableMy.length === 0 && !search && (
                                <div className="route-equipment-editor-empty-state route-equipment-editor-empty-state-my">
                                    <User size={48} strokeWidth={1} className="route-equipment-editor-empty-icon" />
                                    <p>Zatím nemáš žádné vlastní vybavení.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

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
