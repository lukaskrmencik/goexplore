import React, { useState } from 'react';
import { Search, Plus, Package } from 'lucide-react';
import { useEquipment } from './hooks/useEquipment';
import EquipmentManagerCard from './components/EquipmentManagerCard';
import CreateEquipmentModal from './CreateEquipmentModal';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import Toast from '../../../components/ui/Toast';

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
        <div className="flex-1 flex flex-col bg-slate-50 relative rounded-3xl overflow-hidden shadow-sm border border-slate-200">
            {/* Toolbar */}
            <div className="p-4 md:p-6 bg-white/80 backdrop-blur-xl border-b border-slate-200 z-10 sticky top-0">
                <div className="flex flex-col-reverse sm:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Hledat podle názvu..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-slate-700 shadow-sm hover:border-slate-300"
                        />
                    </div>
                    <button
                        onClick={handleCreateNew}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 font-bold transition-all whitespace-nowrap"
                    >
                        <Plus size={20} />
                        Přidat vybavení
                    </button>
                </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 animate-pulse">
                        <Package size={48} className="mb-4 opacity-20" />
                        <span className="font-bold text-lg">Načítám vybavení...</span>
                    </div>
                ) : (
                    <>
                        {equipmentList.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center text-center opacity-60">
                                <Package size={64} strokeWidth={1} className="mb-4 text-slate-400" />
                                <h3 className="text-xl font-bold text-slate-600 mb-2">Nic tu není</h3>
                                <p className="text-slate-500 max-w-sm">
                                    {search ? "Nenalezli jsme žádné vybavení odpovídající tvému hledání." : "Zatím nemáš vytvořené žádné vlastní vybavení. Klikni na tlačítko výše a přidej si první kousek!"}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 auto-rows-min mb-8">
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
                            <div className="flex justify-center items-center gap-2 mt-8 mb-4">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Předchozí
                                </button>

                                <div className="flex gap-1">
                                    {getPageNumbers().map(num => (
                                        <button
                                            key={num}
                                            onClick={() => setPage(num)}
                                            className={`w-10 h-10 rounded-xl text-sm font-bold flex items-center justify-center transition-colors ${page === num
                                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                                                : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50'
                                                }`}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                onSubmit={(newEquipment) => {
                    handleEquipmentCreated(newEquipment);
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
