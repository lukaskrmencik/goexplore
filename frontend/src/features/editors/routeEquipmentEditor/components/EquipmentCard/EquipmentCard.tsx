import React from 'react';
import { Plus, Check, Loader2, Trash2, Package, Pencil } from 'lucide-react';
import type { GeneralEquipment, MyEquipment, EquipmentType } from '../../../../../types/equipment';
import "./EquipmentCard.css";

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
            <div className={`eq-card-compact ${isAdded ? 'eq-card-compact-added' : 'eq-card-compact-default'}`}>
                {/* Image / Icon */}
                <div className={`eq-card-compact-image-wrapper ${imageUrl ? 'eq-card-compact-image-bg-image' : 'eq-card-compact-image-bg-icon'}`}>
                    {imageUrl ? (
                        <img src={imageUrl} alt={item.name} className="eq-card-compact-img" />
                    ) : (
                        <span>{getInitials(item.name)}</span>
                    )}
                </div>

                {/* Content */}
                <div className="eq-card-compact-content">
                    <div className="eq-card-compact-title-row">
                        <h4 className="eq-card-compact-title">
                            {item.name}
                        </h4>
                        {typeName && typeName !== item.name && (
                            <span className="eq-card-compact-type-badge">
                                {typeName}
                            </span>
                        )}
                        {type === 'my' && (
                            <span className="eq-card-compact-my-badge">
                                My
                            </span>
                        )}
                    </div>

                    {/* Specs Inline */}
                    {specsList.length > 0 ? (
                        <div className="eq-card-compact-specs-list">
                            {specsList.map(([key, value]) => (
                                <span key={key} className="eq-card-compact-spec-item">
                                    <span className="eq-card-compact-spec-key">{key.replace(/_/g, ' ')}:</span>
                                    <span className="eq-card-compact-spec-val">{String(value)}</span>
                                </span>
                            ))}
                        </div>
                    ) : (
                        <span className="eq-card-compact-no-specs">Základní</span>
                    )}
                </div>

                {/* Actions */}
                <button
                    onClick={() => onToggle(type, item.id, isAdded)}
                    disabled={isProcessing}
                    className={`eq-card-compact-action-btn ${isAdded ? 'eq-card-compact-action-remove' : 'eq-card-compact-action-add'}`}
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
        <div className={`eq-card-standard ${isAdded ? 'eq-card-standard-added' : 'eq-card-standard-default'}`}>
            {/* Global Green Tint Overlay */}
            {isAdded && (
                <div className="eq-card-overlay" />
            )}

            {/* Centered Checkmark (Desktop only) */}
            {isAdded && (
                <div className="eq-card-check-overlay">
                    <div className="eq-card-check-icon-wrapper">
                        <Check size={32} strokeWidth={4} />
                    </div>
                </div>
            )}

            {/* Image Section */}
            <div className={`eq-card-image-section ${isAdded ? 'eq-card-image-section-added' : ''}`}>
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={item.name}
                        className="eq-card-image"
                    />
                ) : (
                    <div className="eq-card-no-image">
                        <Package className="eq-card-no-image-icon" strokeWidth={1.5} />
                    </div>
                )}

                {/* Badges */}
                <div className="eq-card-badges">
                    {type === 'my' && (
                        <span className="eq-card-badge-my">
                            Vlastní
                        </span>
                    )}
                </div>

                {/* Actions Overlay (Edit/Delete) */}
                <div className="eq-card-actions-overlay">
                    {type === 'my' && (
                        <>
                            {onEdit && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                                    className="eq-card-action-mini-btn eq-card-action-edit"
                                    title="Upravit"
                                >
                                    <Pencil className="eq-card-action-icon" />
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                                    className="eq-card-action-mini-btn eq-card-action-delete"
                                    title="Smazat"
                                >
                                    <Trash2 className="eq-card-action-icon" />
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Content Section */}
            <div className="eq-card-content-section">

                <div className="eq-card-content-inner">
                    <div className="eq-card-title-container">
                        {/* Type Name */}
                        {typeName && typeName !== item.name && (
                            <div className="eq-card-type-name">
                                <span className={`eq-card-type-dot ${isAdded ? 'eq-card-type-dot-added' : 'eq-card-type-dot-default'}`}></span>
                                {typeName}
                            </div>
                        )}

                        <h3 className={`eq-card-name ${isAdded ? 'eq-card-name-added' : 'eq-card-name-default'}`}>
                            {item.name}
                        </h3>
                    </div>

                    {/* Specs Grid */}
                    <div className="eq-card-specs-container">
                        {specsList.length > 0 ? (
                            <div className="eq-card-specs-flex">
                                {specsList.map(([key, value]) => (
                                    <span
                                        key={key}
                                        className={`eq-card-spec-tag ${isAdded ? 'eq-card-spec-tag-added' : 'eq-card-spec-tag-default'}`}
                                    >
                                        <span className="eq-card-spec-tag-key">{key.replace(/_/g, ' ')}:</span>
                                        {String(value)}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className={`eq-card-no-specs-text ${isAdded ? 'eq-card-no-specs-added' : 'eq-card-no-specs-default'}`}>
                                Bez parametrů
                            </p>
                        )}
                    </div>
                </div>

                {/* Primary Action Button */}
                <button
                    onClick={() => onToggle(type, item.id, isAdded)}
                    disabled={isProcessing}
                    className={`eq-card-primary-btn ${isAdded ? 'eq-card-primary-btn-added' : 'eq-card-primary-btn-default'}`}
                >
                    {isProcessing ? (
                        <Loader2 size={20} className="animate-spin" />
                    ) : isAdded ? (
                        <>
                            <Trash2 size={20} className="eq-card-btn-icon-mobile" />
                            <Trash2 size={18} className="eq-card-btn-icon-desktop" />
                            <span className="eq-card-btn-text-desktop">Odebrat</span>
                        </>
                    ) : (
                        <>
                            <Plus size={20} className="eq-card-btn-icon-mobile" />
                            <Plus size={18} className="eq-card-btn-icon-desktop" />
                            <span className="eq-card-btn-text-desktop">Do batohu</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default EquipmentCard;
