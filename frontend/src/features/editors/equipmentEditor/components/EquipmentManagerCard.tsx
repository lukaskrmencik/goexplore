import React from 'react';
import { Trash2, Pencil, Package } from 'lucide-react';
import type { MyEquipment } from '../../../../types/equipment';

interface EquipmentManagerCardProps {
    item: MyEquipment;
    isProcessing: boolean;
    onDelete: (id: number) => void;
    onEdit: () => void;
}

const EquipmentManagerCard: React.FC<EquipmentManagerCardProps> = ({
    item,
    isProcessing,
    onDelete,
    onEdit
}) => {
    // Helper to get initials
    const getInitials = (name: string) => name.slice(0, 2).toUpperCase();

    // Image URL
    const imageUrl = item.img ? `https://goexplore.lukaskrmencik.cz/php/storage/${item.img}` : null;

    // Determine the "Type" name (General Equipment Name)
    let typeName = '';
    if (item.general_equipment) {
        typeName = item.general_equipment.name;
    }

    // Prepare specs for display
    let specs: Record<string, any> = {};
    if (item.specifications) {
        specs = item.specifications;
    } else if (item.general_specifications) {
        specs = item.general_specifications;
    }

    if (typeof specs === 'string') {
        try { specs = JSON.parse(specs); } catch (e) { specs = {}; }
    }
    const specsList = Object.entries(specs).slice(0, 4);

    return (
        <div className="group flex flex-row md:flex-col rounded-2xl border bg-white border-slate-200 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden h-full relative isolate">

            {/* Image Section */}
            <div className="relative shrink-0 w-28 h-full md:w-full md:h-auto md:aspect-[16/10] bg-slate-50 overflow-hidden border-r md:border-r-0 md:border-b border-slate-100 z-0 transition-opacity duration-300">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center text-slate-300">
                        <Package size={24} strokeWidth={1.5} className="md:w-8 md:h-8" />
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-4 flex flex-col flex-1 relative bg-transparent min-w-0">
                <div className="flex-1 min-w-0 flex flex-col justify-start h-full">
                    <div className="mb-3">
                        {typeName && typeName !== item.name && (
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5 truncate">
                                <span className="w-1 h-1 rounded-full shrink-0 bg-emerald-400"></span>
                                {typeName}
                            </div>
                        )}
                        <h3 className="font-bold text-lg leading-tight transition-colors line-clamp-2 text-slate-900 group-hover:text-emerald-700">
                            {item.name}
                        </h3>
                    </div>

                    {/* Specs Grid */}
                    <div className="mb-4">
                        {specsList.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                                {specsList.map(([key, value]) => (
                                    <span
                                        key={key}
                                        className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium border bg-slate-50 text-slate-600 border-slate-100"
                                    >
                                        <span className="opacity-50 mr-1 capitalize">{key.replace(/_/g, ' ')}:</span>
                                        {String(value)}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs italic text-slate-400">
                                Bez parametrů
                            </p>
                        )}
                    </div>
                </div>

                {/* Actions (Edit / Delete buttons with priority) */}
                <div className="mt-auto flex items-center gap-2 pt-2 border-t border-slate-100/50">
                    <button
                        onClick={onEdit}
                        disabled={isProcessing}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-sm transition-colors"
                    >
                        <Pencil size={16} />
                        Upravit
                    </button>
                    <button
                        onClick={() => onDelete(item.id)}
                        disabled={isProcessing}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 font-bold text-sm transition-colors"
                    >
                        <Trash2 size={16} />
                        Smazat
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EquipmentManagerCard;
