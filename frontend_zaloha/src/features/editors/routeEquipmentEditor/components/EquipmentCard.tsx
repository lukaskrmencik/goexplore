import React from 'react';
import { Plus, Check, Loader2, Trash2, Pencil, Package } from 'lucide-react';
import type { GeneralEquipment, MyEquipment, EquipmentType } from '../../../../types/equipment';

interface EquipmentCardProps {
    item: GeneralEquipment | MyEquipment;
    type: EquipmentType;
    isAdded: boolean;
    isProcessing: boolean;
    onToggle: (type: EquipmentType, id: number, isAdded: boolean) => void;
    onDelete?: (id: number) => void;
    onEdit?: () => void;
    variant?: 'standard' | 'compact';
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({
    item,
    type,
    isAdded,
    isProcessing,
    onToggle,
    onDelete,
    onEdit,
    variant = 'standard'
}) => {

    // Helper to get initials
    const getInitials = (name: string) => name.slice(0, 2).toUpperCase();

    // Image URL
    const imageUrl = item.img ? `https://goexplore.lukaskrmencik.cz/php/storage/${item.img}` : null;

    // Determine the "Type" name (General Equipment Name)
    let typeName = '';

    // If it's MyEquipment (has general_equipment_id)
    if ('general_equipment' in item && item.general_equipment) {
        typeName = item.general_equipment.name;
    }

    // Prepare specs for display
    let specs: Record<string, any> = {};

    if ('specifications' in item) {
        specs = item.specifications;
    } else if ('general_specifications' in item) {
        specs = item.general_specifications;
    }

    // Safeguard against stringified JSON (legacy data)
    if (typeof specs === 'string') {
        try {
            specs = JSON.parse(specs);
        } catch (e) {
            specs = {};
        }
    }
    const specsList = Object.entries(specs).slice(0, 4); // Show max 4 specs

    // --- COMPACT VARIANT (Horizontal - for Backpack) ---
    if (variant === 'compact') {
        return (
            <div
                className={`
                    group relative flex items-center p-3 rounded-xl border transition-all duration-200 bg-white
                    ${isAdded
                        ? 'border-emerald-200 shadow-sm'
                        : 'border-slate-100 hover:border-emerald-200 hover:shadow-md'
                    }
                `}
            >
                {/* Image / Icon */}
                <div className={`
                    h-14 w-14 shrink-0 rounded-lg overflow-hidden relative border border-slate-100
                    ${imageUrl ? 'bg-white' : 'bg-slate-50 flex items-center justify-center text-slate-400 font-bold'}
                `}>
                    {imageUrl ? (
                        <img src={imageUrl} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                        <span>{getInitials(item.name)}</span>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 ml-4 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-900 text-sm truncate leading-tight">
                            {item.name}
                        </h4>
                        {typeName && typeName !== item.name && (
                            <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded-md truncate max-w-[100px]">
                                {typeName}
                            </span>
                        )}
                        {type === 'my' && (
                            <span className="text-[9px] font-black text-indigo-500 uppercase tracking-wider bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                                My
                            </span>
                        )}
                    </div>

                    {/* Specs Inline */}
                    {specsList.length > 0 ? (
                        <div className="flex items-center gap-2 flex-wrap">
                            {specsList.map(([key, value]) => (
                                <span key={key} className="text-[10px] text-slate-500 flex items-center gap-1">
                                    <span className="opacity-50">{key.replace(/_/g, ' ')}:</span>
                                    <span className="font-medium">{String(value)}</span>
                                </span>
                            ))}
                        </div>
                    ) : (
                        <span className="text-[10px] text-slate-400 italic">Základní</span>
                    )}
                </div>

                {/* Actions */}
                <button
                    onClick={() => onToggle(type, item.id, isAdded)}
                    disabled={isProcessing}
                    className={`
                        h-9 w-9 flex items-center justify-center rounded-xl transition-all ml-3 shrink-0
                        ${isAdded
                            ? 'bg-white border border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-transparent'
                        }
                    `}
                    title={isAdded ? "Odebrat z batohu" : "Přidat do batohu"}
                >
                    {isProcessing ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : isAdded ? (
                        <Trash2 size={18} />
                    ) : (
                        <Plus size={18} />
                    )}
                </button>
            </div>
        );
    }

    // --- STANDARD VARIANT (Vertical - for Warehouse/Catalog) ---
    return (
        <div
            className={`
                group flex flex-row md:flex-col rounded-2xl border transition-all duration-300 overflow-hidden h-full relative isolate
                ${isAdded
                    ? 'border-l-4 border-l-emerald-500 border-y border-r border-slate-200 md:border-emerald-500 md:shadow-lg md:shadow-emerald-500/20 md:bg-emerald-50/30 bg-emerald-50/10'
                    : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1'
                }
            `}
        >
            {/* Global Green Tint Overlay (Covering everything, including images) */}
            {isAdded && (
                <div className="absolute inset-0 z-20 bg-emerald-500/10 pointer-events-none mix-blend-multiply" />
            )}

            {/* Centered Checkmark (Prominent, on top of image and content) - DESKTOP ONLY */}
            {isAdded && (
                <div className="absolute inset-0 z-30 hidden md:flex items-center justify-center pointer-events-none">
                    <div className="bg-emerald-100/90 text-emerald-600 p-3 rounded-full shadow-sm animate-in zoom-in duration-300 backdrop-blur-sm border border-emerald-200">
                        <Check size={32} strokeWidth={4} />
                    </div>
                </div>
            )}

            {/* Image Section (Left on mobile, Top on desktop) */}
            <div className={`
                relative shrink-0
                w-28 h-full md:w-full md:h-auto md:aspect-[16/10]
                bg-slate-50 overflow-hidden border-r md:border-r-0 md:border-b border-slate-100 z-0
                transition-opacity duration-300
                ${isAdded ? 'opacity-90 grayscale-[20%]' : ''}
            `}>
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

                {/* Badges (z-10, above image, behind overlays) */}
                <div className="absolute top-2 left-2 flex flex-col gap-1 items-start z-10">
                    {type === 'my' && (
                        <span className="px-1.5 py-0.5 md:px-2 md:py-1 bg-white/90 backdrop-blur text-indigo-600 text-[9px] md:text-[10px] font-bold uppercase tracking-wider rounded md:rounded-lg shadow-sm">
                            Vlastní
                        </span>
                    )}
                </div>

                {/* Actions Overlay (Edit/Delete) - Only for My Equipment - z-40 to be clickable above tint */}
                <div className="absolute bottom-1 right-1 md:top-2 md:right-2 md:bottom-auto flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300 md:translate-y-2 group-hover:translate-y-0 z-40 pointer-events-auto">
                    {type === 'my' && (
                        <>
                            {onEdit && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                                    className="p-1.5 md:p-2 bg-white/90 backdrop-blur hover:bg-white text-slate-600 hover:text-indigo-600 rounded-md md:rounded-lg shadow-sm hover:shadow-md transition-all"
                                    title="Upravit"
                                >
                                    <Pencil size={12} className="md:w-[14px] md:h-[14px]" />
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                                    className="p-1.5 md:p-2 bg-white/90 backdrop-blur hover:bg-white text-slate-600 hover:text-rose-600 rounded-md md:rounded-lg shadow-sm hover:shadow-md transition-all"
                                    title="Smazat"
                                >
                                    <Trash2 size={12} className="md:w-[14px] md:h-[14px]" />
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Content Section */}
            {/* Content Section */}
            <div className="p-3 md:p-4 flex flex-row md:flex-col justify-between md:justify-start items-center md:items-stretch flex-1 relative bg-transparent min-w-0 gap-3 md:gap-0">

                <div className="flex-1 min-w-0 flex flex-col justify-center md:justify-start h-full">
                    <div className="mb-1 md:mb-3">
                        {/* Type Name (if different from name) */}
                        {typeName && typeName !== item.name && (
                            <div className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5 truncate">
                                <span className={`w-1 h-1 rounded-full shrink-0 ${isAdded ? 'bg-emerald-600' : 'bg-emerald-400'}`}></span>
                                {typeName}
                            </div>
                        )}

                        <h3 className={`font-bold text-sm md:text-lg leading-tight transition-colors line-clamp-2 ${isAdded ? 'text-emerald-900' : 'text-slate-900 group-hover:text-emerald-700'}`}>
                            {item.name}
                        </h3>
                    </div>

                    {/* Specs Grid - ALWAYS VISIBLE NOW */}
                    <div className="mb-0 md:mb-4">
                        {specsList.length > 0 ? (
                            <div className="flex flex-wrap gap-1 md:gap-1.5">
                                {specsList.map(([key, value]) => (
                                    <span
                                        key={key}
                                        className={`inline-flex items-center px-1.5 py-0.5 md:px-2 md:py-1 rounded-md text-[9px] md:text-[10px] font-medium border ${isAdded ? 'bg-emerald-100/50 text-emerald-800 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-100'}`}
                                    >
                                        <span className="opacity-50 mr-1 capitalize">{key.replace(/_/g, ' ')}:</span>
                                        {String(value)}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className={`text-[10px] md:text-xs italic ${isAdded ? 'text-emerald-600/60' : 'text-slate-400'}`}>
                                Bez parametrů
                            </p>
                        )}
                    </div>
                </div>

                {/* Primary Action Button - ICON ONLY ON MOBILE */}
                <button
                    onClick={() => onToggle(type, item.id, isAdded)}
                    disabled={isProcessing}
                    className={`
                        md:w-full md:mt-auto shrink-0
                        h-10 w-10 md:h-auto md:w-auto
                        md:py-2.5 rounded-xl 
                        text-xs md:text-sm font-bold transition-all 
                        flex items-center justify-center gap-1.5 md:gap-2 
                        group/btn relative z-40 ml-auto md:ml-0
                        ${isAdded
                            ? 'bg-white border-slate-200 text-slate-700 hover:text-rose-600 border shadow-sm md:bg-white md:border md:border-slate-200 md:text-slate-700 md:hover:bg-rose-50 md:hover:text-rose-600 md:hover:border-rose-200'
                            : 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 hover:shadow-emerald-600/30 md:bg-emerald-600 md:text-white md:hover:bg-emerald-700 md:shadow-lg md:shadow-emerald-500/20'
                        }
                    `}
                >
                    {isProcessing ? (
                        <Loader2 size={20} className="animate-spin" />
                    ) : isAdded ? (
                        <>
                            <Trash2 size={20} className="md:hidden" />
                            <Trash2 size={18} className="hidden md:block group-hover/btn:scale-110 transition-transform" />
                            <span className="hidden md:inline">Odebrat</span>
                        </>
                    ) : (
                        <>
                            <Plus size={20} className="md:hidden group-hover/btn:scale-110 transition-transform" />
                            <Plus size={18} className="hidden md:block group-hover/btn:scale-110 transition-transform" />
                            <span className="hidden md:inline">Do batohu</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default EquipmentCard;
