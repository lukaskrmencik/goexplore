import React from 'react';
import { Trash2, Pencil, Package } from 'lucide-react';
import type { MyEquipment } from '../../../../../types/equipment';
import './EquipmentManagerCard.css';

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
    } else if (item.general_equipment?.general_specifications) {
        specs = item.general_equipment.general_specifications;
    }

    if (typeof specs === 'string') {
        try { specs = JSON.parse(specs); } catch (e) { specs = {}; }
    }
    const specsList = Object.entries(specs).slice(0, 4);

    return (
        <div className="equipment-manager-card">

            {/* Image Section */}
            <div className="equipment-manager-card-image-wrapper">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={item.name}
                        className="equipment-manager-card-image"
                    />
                ) : (
                    <div className="equipment-manager-card-empty-img">
                        <Package className="equipment-manager-card-empty-icon" />
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="equipment-manager-card-content">
                <div className="equipment-manager-card-info">
                    <div className="equipment-manager-card-header">
                        {typeName && typeName !== item.name && (
                            <div className="equipment-manager-card-type">
                                <span className="equipment-manager-card-dot"></span>
                                {typeName}
                            </div>
                        )}
                        <h3 className="equipment-manager-card-title">
                            {item.name}
                        </h3>
                    </div>

                    {/* Specs Grid */}
                    <div className="equipment-manager-card-specs">
                        {specsList.length > 0 ? (
                            <div className="equipment-manager-card-specs-flex">
                                {specsList.map(([key, value]) => (
                                    <span
                                        key={key}
                                        className="equipment-manager-card-spec-item"
                                    >
                                        <span className="equipment-manager-card-spec-key">{key.replace(/_/g, ' ')}:</span>
                                        {String(value)}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="equipment-manager-card-no-specs">
                                Bez parametrů
                            </p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="equipment-manager-card-actions">
                    <button
                        onClick={onEdit}
                        disabled={isProcessing}
                        className="equipment-manager-card-btn equipment-manager-card-btn-edit"
                    >
                        <Pencil size={16} />
                        Upravit
                    </button>
                    <button
                        onClick={() => onDelete(item.id)}
                        disabled={isProcessing}
                        className="equipment-manager-card-btn equipment-manager-card-btn-delete"
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
