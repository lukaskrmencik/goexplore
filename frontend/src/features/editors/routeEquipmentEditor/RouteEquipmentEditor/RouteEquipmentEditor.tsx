import React from 'react';
import { Plus, Package, Search, User } from "lucide-react";
import type { RouteEditorProps } from "../../../../types/editor";
import type { MyEquipment } from "../../../../types/equipment";
import { useRouteEquipment } from ".././hooks/useRouteEquipment";
import EquipmentCard from ".././components/EquipmentCard/EquipmentCard";
import BackpackPanel from ".././components/BackpackPanel/BackpackPanel";
import EquipmentSearchTabs from ".././components/EquipmentSearchTabs/EquipmentSearchTabs";
import CreateEquipmentModal from "../../equipmentEditor/CreateEquipmentModal/CreateEquipmentModal";
import ConfirmDialog from "../../../../components/ui/ConfirmDialog/ConfirmDialog";
import Toast from "../../../../components/ui/Toast/Toast";
import Pagination from "../../../../components/ui/Pagination/Pagination";
import "./RouteEquipmentEditor.css";

const RouteEquipmentEditor: React.FC<RouteEditorProps> = ({ route, onUpdate }) => {
    const {
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
        clearError
    } = useRouteEquipment(route, onUpdate);

    const [isBackpackPanelOpen, setIsBackpackPanelOpen] = React.useState(false);
    const [isEquipmentModalOpen, setIsEquipmentModalOpen] = React.useState(false);
    const [equipmentBeingEdited, setEquipmentBeingEdited] = React.useState<MyEquipment | null>(null);
    const [equipmentIdPendingDeletion, setEquipmentIdPendingDeletion] = React.useState<number | null>(null);

    const handleOpenEditModal = (item: MyEquipment) => {
        setEquipmentBeingEdited(item);
        setIsEquipmentModalOpen(true);
    };

    const handleOpenCreateModal = () => {
        setEquipmentBeingEdited(null);
        setIsEquipmentModalOpen(true);
    };

    return (
        <div className="route-equipment-editor-container">

            {isBackpackPanelOpen && (
                <div
                    className="route-equipment-editor-backdrop"
                    onClick={() => setIsBackpackPanelOpen(false)}
                />
            )}

            <BackpackPanel
                isOpen={isBackpackPanelOpen}
                onTogglePanel={() => setIsBackpackPanelOpen(!isBackpackPanelOpen)}
                onClosePanel={() => setIsBackpackPanelOpen(false)}
                resolvedBackpackItems={resolvedBackpackItems}
                processingId={processingId}
                currentUser={currentUser}
                onToggleEquipment={handleToggleItem}
            />

            <div className="route-equipment-editor-warehouse-panel">

                <EquipmentSearchTabs
                    search={search}
                    onSearchChange={setSearch}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />

                <div className="route-equipment-editor-warehouse-list">
                    {isLoading ? (
                        <div className="route-equipment-editor-loading">
                            <Package size={48} className="route-equipment-editor-loading-icon" />
                            <span style={{ fontWeight: 700 }}>Načítám sklad...</span>
                        </div>
                    ) : (
                        <div className="route-equipment-editor-grid">
                            {activeTab === 'my' && (
                                <div
                                    onClick={handleOpenCreateModal}
                                    className="route-equipment-editor-create-card"
                                >
                                    <div className="route-equipment-editor-create-card-icon-wrapper">
                                        <Plus size={32} />
                                    </div>
                                    <span className="route-equipment-editor-create-card-text">Vytvořit vybavení</span>
                                </div>
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
                                        currentUser={currentUser}
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
                                        onDelete={(id) => setEquipmentIdPendingDeletion(id)}
                                        onEdit={() => handleOpenEditModal(item)}
                                        variant="standard"
                                        currentUser={currentUser}
                                    />
                                ))
                            )}

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

                    {!isLoading && totalPages > 1 && (
                        <div className="route-equipment-editor-pagination-wrapper">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </div>

                {error && <Toast message={error} onClose={clearError} />}
            </div>

            <CreateEquipmentModal
                isOpen={isEquipmentModalOpen}
                onClose={() => setIsEquipmentModalOpen(false)}
                initialData={equipmentBeingEdited}
                onSubmit={(newEquipment) => {
                    handleEquipmentCreated(newEquipment);
                    setIsEquipmentModalOpen(false);
                }}
            />

            <ConfirmDialog
                isOpen={!!equipmentIdPendingDeletion}
                title="Smazat vybavení?"
                description="Tato akce je nevratná. Vybavení bude odebráno ze všech tras a trvale smazáno."
                confirmLabel="Smazat"
                isDestructive={true}
                onConfirm={async () => {
                    if (equipmentIdPendingDeletion) {
                        await handleDeleteMyEquipment(equipmentIdPendingDeletion);
                        setEquipmentIdPendingDeletion(null);
                    }
                }}
                onCancel={() => setEquipmentIdPendingDeletion(null)}
                isLoading={processingId === equipmentIdPendingDeletion}
            />

        </div>
    );
};

export default RouteEquipmentEditor;
