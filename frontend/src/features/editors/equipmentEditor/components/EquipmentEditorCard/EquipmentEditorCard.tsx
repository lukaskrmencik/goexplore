import React from 'react';
import { Trash2, Pencil, Package } from 'lucide-react';
import type { MyEquipment } from '../../../../../types/equipment';
import { getImageUrl } from '../../../../../utils/imageUrl';
import './EquipmentEditorCard.css';

interface EquipmentEditorCardProps {
    item: MyEquipment;
    isProcessing: boolean;
    onDelete: () => void;
    onEdit: () => void;
}

function resolveEquipmentTypeName(item: MyEquipment): string {
    return item.general_equipment?.name ?? '';
}

function resolveEquipmentSpecs(item: MyEquipment): Record<string, unknown> {
    const raw: unknown = item.specifications || item.general_equipment?.general_specifications || {};
    if (typeof raw === 'string') {
        try { return JSON.parse(raw); } catch { return {}; }
    }
    return typeof raw === 'object' && raw !== null ? raw as Record<string, unknown> : {};
}

const EquipmentEditorCard: React.FC<EquipmentEditorCardProps> = ({
    item,
    isProcessing,
    onDelete,
    onEdit,
}) => {
    const imageUrl = getImageUrl(item.img);
    const typeName = resolveEquipmentTypeName(item);
    const displaySpecs = Object.entries(resolveEquipmentSpecs(item)).slice(0, 4);

    return (
        <div className="equipment-editor-card">
            <div className="equipment-editor-card-image-wrapper">
                {imageUrl ? (
                    <img src={imageUrl} alt={item.name} className="equipment-editor-card-image" />
                ) : (
                    <div className="equipment-editor-card-empty-img">
                        <Package className="equipment-editor-card-empty-icon" />
                    </div>
                )}
            </div>

            <div className="equipment-editor-card-content">
                <div className="equipment-editor-card-info">
                    <div className="equipment-editor-card-header">
                        {typeName && typeName !== item.name && (
                            <div className="equipment-editor-card-type">
                                <span className="equipment-editor-card-dot"></span>
                                {typeName}
                            </div>
                        )}
                        <h3 className="equipment-editor-card-title">{item.name}</h3>
                    </div>

                    <div className="equipment-editor-card-specs">
                        {displaySpecs.length > 0 ? (
                            <div className="equipment-editor-card-specs-flex">
                                {displaySpecs.map(([key, value]) => (
                                    <span key={key} className="equipment-editor-card-spec-item">
                                        <span className="equipment-editor-card-spec-key">{key.replace(/_/g, ' ')}:</span>
                                        {String(value)}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="equipment-editor-card-no-specs">Bez parametrů</p>
                        )}
                    </div>
                </div>

                <div className="equipment-editor-card-actions">
                    <button
                        onClick={onEdit}
                        disabled={isProcessing}
                        className="equipment-editor-card-btn equipment-editor-card-btn-edit"
                    >
                        <Pencil size={16} />
                        Upravit
                    </button>
                    <button
                        onClick={onDelete}
                        disabled={isProcessing}
                        className="equipment-editor-card-btn equipment-editor-card-btn-delete"
                    >
                        <Trash2 size={16} />
                        Smazat
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EquipmentEditorCard;
