import React, { useState } from 'react';
import { Search, Plus, Package } from 'lucide-react';
import { useEquipment } from '.././hooks/useEquipment';
import EquipmentManagerCard from '.././components/EquipmentManagerCard/EquipmentManagerCard';
import CreateEquipmentModal from '.././CreateEquipmentModal/CreateEquipmentModal';
import ConfirmDialog from '../../../../components/ui/ConfirmDialog/ConfirmDialog';
import { Input } from '../../../../components/ui/Input/Input';
import Pagination from '../../../../components/ui/Pagination/Pagination';
import Toast from '../../../../components/ui/Toast/Toast';
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
        clearError
    } = useEquipment();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEquipment, setEditingEquipment] = useState<any | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleCreateNew = () => {
        setEditingEquipment(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item: any) => {
        setEditingEquipment(item);
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (deletingId) {
            await handleDeleteEquipment(deletingId);
            setDeletingId(null);
        }
    };


    return (
        <div className="equipment-editor-container">
            {/* Page Header & Filters */}
            <div className="equipment-editor-header-wrapper">
                <h1 className="equipment-editor-title">Moje vybavení</h1>

                <div className="equipment-editor-search-wrapper">
                    <Input
                        icon={Search}
                        placeholder="Hledat vybavení..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="equipment-editor-actions-container">
                    <button
                        onClick={handleCreateNew}
                        className="equipment-editor-create-btn"
                    >
                        <Plus size={20} />
                        Přidat vybavení
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {isLoading ? (
                <div className="equipment-editor-loading">
                    <Package size={48} className="equipment-editor-loading-icon" />
                    <span className="equipment-editor-loading-text">Načítám vybavení...</span>
                </div>
            ) : (
                <div className="equipment-editor-content-wrapper">
                    <div className="equipment-editor-grid">
                        {/* Create Card — always first, on page 1 */}
                        {page === 1 && (
                            <div
                                onClick={handleCreateNew}
                                className="equipment-editor-create-card"
                            >
                                <div className="equipment-editor-create-icon-wrapper">
                                    <Plus size={32} />
                                </div>
                                <span className="equipment-editor-create-text">Přidat vybavení</span>
                            </div>
                        )}

                        {equipmentList.map(item => (
                            <EquipmentManagerCard
                                key={item.id}
                                item={item}
                                isProcessing={processingId === item.id}
                                onEdit={() => handleEdit(item)}
                                onDelete={() => setDeletingId(item.id)}
                            />
                        ))}

                        {/* Search empty hint — only when filtering returns nothing */}
                        {search && equipmentList.length === 0 && (
                            <div className="equipment-editor-search-empty">
                                <Package size={40} strokeWidth={1} className="equipment-editor-empty-icon" />
                                <p className="equipment-editor-empty-desc">Nenalezli jsme žádné vybavení odpovídající tvému hledání.</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {(totalPages > 1 && equipmentList.length > 0) && (
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

            {/* Warning/Info Toast Placeholder */}
            {error && <Toast message={error} onClose={clearError} />}

            {/* Create Modal */}
            <CreateEquipmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={editingEquipment}
                onSubmit={() => {
                    handleEquipmentCreated();
                    setIsModalOpen(false);
                }}
            />

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                isOpen={!!deletingId}
                title="Smazat vybavení?"
                description="Tato akce je nevratná. Vybavení bude odebráno ze všech tras a trvale smazáno ze systému."
                confirmLabel="Smazat"
                isDestructive={true}
                onConfirm={confirmDelete}
                onCancel={() => setDeletingId(null)}
                isLoading={processingId === deletingId}
            />
        </div>
    );
};

export default EquipmentEditor;
