import React from 'react';
import { Plus, Loader2, Trash2, Package, Pencil } from 'lucide-react';
import type { GeneralEquipment, MyEquipment, EquipmentType } from '../../../../../types/equipment';
import type { User } from '../../../../../types/users';
import UserAvatar from '../../../../../components/ui/UserAvatar/UserAvatar';
import { getImageUrl } from '../../../../../utils/imageUrl';
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
    currentUser?: User | null;
}

function resolveItemTypeName(item: GeneralEquipment | MyEquipment): string {
    if ('general_equipment' in item && item.general_equipment) {
        return item.general_equipment.name;
    }
    return '';
}

function resolveItemSpecsList(item: GeneralEquipment | MyEquipment): [string, unknown][] {
    let specs: Record<string, unknown> = {};

    if ('specifications' in item) {
        specs = item.specifications;
    } else if ('general_specifications' in item) {
        specs = item.general_specifications;
    }

    if (typeof specs === 'string') {
        try {
            specs = JSON.parse(specs);
        } catch {
            specs = {};
        }
    }

    return Object.entries(specs).slice(0, 4);
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({
    item,
    type,
    isAdded,
    isProcessing,
    onToggle,
    onDelete,
    onEdit,
    variant = 'standard',
    currentUser

}) => {
    const imageUrl = getImageUrl(item.img);
    const typeName = resolveItemTypeName(item);
    const specsList = resolveItemSpecsList(item);

    const isOwnedByCurrentUser = 'users_id' in item && currentUser && item.users_id === currentUser.id;
    const itemOwnerUser = 'user' in item ? item.user : null;

    {/* --- START: AI-GENERATED UI (Gemini 3.1 Pro) --- */}
    {/* Layout and structure generated from design. Data binding and variables added manually. */}

    const OwnerBadgeContent: React.FC = () => {
        if (isOwnedByCurrentUser) {
            return (
                <>
                    <UserAvatar
                        name={currentUser!.name}
                        profilePicture={currentUser!.profile_picture}
                        size="sm"
                        className="eq-card-compact-avatar"
                    />
                    <span>Moje</span>
                </>
            );
        }
        if (itemOwnerUser) {
            return (
                <>
                    <UserAvatar
                        name={itemOwnerUser.name}
                        profilePicture={itemOwnerUser.profile_picture}
                        size="sm"
                        className="eq-card-compact-avatar"
                    />
                    <span>{itemOwnerUser.name}</span>
                </>
            );
        }
        return <span>Sdílené</span>;
    };

    if (variant === 'compact') {
        return (
            <div className={`eq-card-compact ${isAdded ? 'eq-card-compact-added' : 'eq-card-compact-default'}`}>
                <div className={`eq-card-compact-image-wrapper ${imageUrl ? 'eq-card-compact-image-bg-image' : 'eq-card-compact-image-bg-icon'}`}>
                    {imageUrl ? (
                        <img src={imageUrl} alt={item.name} className="eq-card-compact-img" />
                    ) : (
                        <span>{item.name.slice(0, 2).toUpperCase()}</span>
                    )}
                </div>

                <div className="eq-card-compact-content">
                    <h4 className="eq-card-compact-title">{item.name}</h4>
                    <div className="eq-card-compact-meta-row">
                        {typeName && typeName !== item.name && (
                            <span className="eq-card-compact-type-badge">{typeName}</span>
                        )}
                        {type === 'my' && (
                            <span className="eq-card-compact-my-badge">
                                <OwnerBadgeContent />
                            </span>
                        )}
                    </div>
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

                <button
                    onClick={() => onToggle(type, item.id, isAdded)}
                    disabled={isProcessing}
                    className={`eq-card-compact-action-btn ${isAdded ? 'eq-card-compact-action-remove' : 'eq-card-compact-action-add'}`}
                    title={isAdded ? "Odebrat z vybraného" : "Přidat"}
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

    return (
        <div className={`eq-card-standard ${isAdded ? 'eq-card-standard-added' : 'eq-card-standard-default'}`}>
            {isAdded && <div className="eq-card-overlay" />}

            <div className={`eq-card-image-section ${isAdded ? 'eq-card-image-section-added' : ''}`}>
                {imageUrl ? (
                    <img src={imageUrl} alt={item.name} className="eq-card-image" />
                ) : (
                    <div className="eq-card-no-image">
                        <Package className="eq-card-no-image-icon" strokeWidth={1.5} />
                    </div>
                )}

                <div className="eq-card-badges">
                    {type === 'my' && (
                        <span className="eq-card-badge-my">
                            <OwnerBadgeContent />
                        </span>
                    )}
                </div>

                <div className="eq-card-actions-overlay">
                    {type === 'my' && isOwnedByCurrentUser && (
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

            <div className="eq-card-content-section">
                <div className="eq-card-content-inner">
                    <div className="eq-card-title-container">
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
                            <span className="eq-card-btn-text-desktop">Přidat k trase</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );

    {/* --- END: AI-GENERATED UI --- */}
};

export default EquipmentCard;
