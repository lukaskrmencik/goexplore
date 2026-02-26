import React, { useState } from 'react';
import { Package, Plus } from 'lucide-react';
import { useEquipment } from '.././hooks/useEquipment';
import EquipmentEditorCard from '.././components/EquipmentEditorCard/EquipmentEditorCard';
import EquipmentEditorHeader from '.././components/EquipmentEditorHeader/EquipmentEditorHeader';
import CreateEquipment from '.././CreateEquipment/CreateEquipment/CreateEquipment';
import ConfirmDialog from '../../../../components/ui/ConfirmDialog/ConfirmDialog';
import Pagination from '../../../../components/ui/Pagination/Pagination';
import Toast from '../../../../components/ui/Toast/Toast';
import type { MyEquipment } from '../../../../types/equipment';
import './EquipmentEditor.css';

const EquipmentEditor: React.FC = () => {
    const {
        equipmentList,
        isLoading,
        search,
        setSearch,
        page,
        setPage,
        totalPages,
        handleEquipmentCreated,
        handleDeleteEquipment,
        processingId,
        error,
        clearError,
    } = useEquipment();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [equipmentBeingEdited, setEquipmentBeingEdited] = useState<MyEquipment | null>(null);
    const [equipmentIdPendingDeletion, setEquipmentIdPendingDeletion] = useState<number | null>(null);

    const handleCreateNew = () => {
        setEquipmentBeingEdited(null);
        setIsModalOpen(true);
    };

    const handleEditEquipment = (item: MyEquipment) => {
        setEquipmentBeingEdited(item);
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (equipmentIdPendingDeletion) {
            await handleDeleteEquipment(equipmentIdPendingDeletion);
            setEquipmentIdPendingDeletion(null);
        }
    };

    return (
        <div className="equipment-editor-container">
            <EquipmentEditorHeader
                search={search}
                onSearchChange={setSearch}
                onCreateNew={handleCreateNew}
            />

            {isLoading ? (
                <div className="equipment-editor-loading">
                    <Package size={48} className="equipment-editor-loading-icon" />
                    <span className="equipment-editor-loading-text">Načítám vybavení...</span>
                </div>
            ) : (
                <div className="equipment-editor-content-wrapper">
                    <div className="equipment-editor-grid">
                        {page === 1 && (
                            <div onClick={handleCreateNew} className="equipment-editor-create-card">
                                <div className="equipment-editor-create-icon-wrapper">
                                    <Plus size={32} />
                                </div>
                                <span className="equipment-editor-create-text">Přidat vybavení</span>
                            </div>
                        )}

                        {equipmentList.map(item => (
                            <EquipmentEditorCard
                                key={item.id}
                                item={item}
                                isProcessing={processingId === item.id}
                                onEdit={() => handleEditEquipment(item)}
                                onDelete={() => setEquipmentIdPendingDeletion(item.id)}
                            />
                        ))}

                        {search && equipmentList.length === 0 && (
                            <div className="equipment-editor-search-empty">
                                <Package size={40} strokeWidth={1} className="equipment-editor-empty-icon" />
                                <p className="equipment-editor-empty-desc">Nenalezli jsme žádné vybavení odpovídající tvému hledání.</p>
                            </div>
                        )}
                    </div>

                    {totalPages > 1 && equipmentList.length > 0 && (
                        <div className="equipment-editor-pagination-wrapper">
                            <Pagination
                                currentPage={page}
                                totalPages={totalPages}
                                onPageChange={setPage}
                            />
                        </div>
                    )}
                </div>
            )}

            {error && <Toast message={error} onClose={clearError} />}

            <CreateEquipment
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={equipmentBeingEdited}
                onSubmit={() => {
                    handleEquipmentCreated();
                    setIsModalOpen(false);
                }}
            />

            <ConfirmDialog
                isOpen={!!equipmentIdPendingDeletion}
                title="Smazat vybavení?"
                description="Tato akce je nevratná. Vybavení bude odebráno ze všech tras a trvale smazáno ze systému."
                confirmLabel="Smazat"
                isDestructive={true}
                onConfirm={confirmDelete}
                onCancel={() => setEquipmentIdPendingDeletion(null)}
                isLoading={processingId === equipmentIdPendingDeletion}
            />
        </div>
    );
};

export default EquipmentEditor;
