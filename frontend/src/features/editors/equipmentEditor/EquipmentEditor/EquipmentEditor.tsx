import React, { useState } from 'react';
import { Search, Plus, Package } from 'lucide-react';
import { useEquipment } from '.././hooks/useEquipment';
import EquipmentManagerCard from '.././components/EquipmentManagerCard/EquipmentManagerCard';
import CreateEquipmentModal from '.././CreateEquipmentModal/CreateEquipmentModal';
import ConfirmDialog from '../../../../components/ui/ConfirmDialog/ConfirmDialog';
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

    // Helper to generate pagination numbers
    const getPageNumbers = () => {
        const pages = [];
        let start = Math.max(1, page - 2);
        let end = Math.min(totalPages, page + 2);

        // Adjust to always show 5 pages if possible
        if (end - start < 4) {
            if (start === 1) {
                end = Math.min(totalPages, start + 4);
            } else if (end === totalPages) {
                start = Math.max(1, end - 4);
            }
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <div className="equipment-editor-container">
            {/* Toolbar */}
            <div className="equipment-editor-toolbar">
                <div className="equipment-editor-toolbar-flex">
                    <div className="equipment-editor-search-wrapper">
                        <Search className="equipment-editor-search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Hledat podle názvu..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="equipment-editor-search-input"
                        />
                    </div>
                    <button
                        onClick={handleCreateNew}
                        className="equipment-editor-create-btn"
                    >
                        <Plus size={20} />
                        Přidat vybavení
                    </button>
                </div>
            </div>

            {/* List Content */}
            <div className="equipment-editor-list-content">
                {isLoading ? (
                    <div className="equipment-editor-loading">
                        <Package size={48} className="equipment-editor-loading-icon" />
                        <span className="equipment-editor-loading-text">Načítám vybavení...</span>
                    </div>
                ) : (
                    <>
                        {equipmentList.length === 0 ? (
                            <div className="equipment-editor-empty">
                                <Package size={64} strokeWidth={1} className="equipment-editor-empty-icon" />
                                <h3 className="equipment-editor-empty-title">Nic tu není</h3>
                                <p className="equipment-editor-empty-desc">
                                    {search ? "Nenalezli jsme žádné vybavení odpovídající tvému hledání." : "Zatím nemáš vytvořené žádné vlastní vybavení. Klikni na tlačítko výše a přidej si první kousek!"}
                                </p>
                            </div>
                        ) : (
                            <div className="equipment-editor-grid">
                                {equipmentList.map(item => (
                                    <EquipmentManagerCard
                                        key={item.id}
                                        item={item}
                                        isProcessing={processingId === item.id}
                                        onEdit={() => handleEdit(item)}
                                        onDelete={() => setDeletingId(item.id)}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && equipmentList.length > 0 && (
                            <div className="equipment-editor-pagination">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="equipment-editor-page-btn"
                                >
                                    Předchozí
                                </button>

                                <div className="equipment-editor-page-numbers">
                                    {getPageNumbers().map(num => (
                                        <button
                                            key={num}
                                            onClick={() => setPage(num)}
                                            className={`equipment-editor-num-btn ${page === num ? 'equipment-editor-num-btn-active' : 'equipment-editor-num-btn-inactive'}`}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="equipment-editor-page-btn"
                                >
                                    Další
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

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
