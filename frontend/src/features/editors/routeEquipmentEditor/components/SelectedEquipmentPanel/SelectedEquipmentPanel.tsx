import { ChevronUp, X } from "lucide-react";
import './SelectedEquipmentPanel.css';
import type { EquipmentType } from "../../../../../types/equipment";
import type { User } from "../../../../../types/users";
import type { ResolvedSelectedEquipmentItem } from "../../hooks/useRouteEquipment";
import EquipmentCard from "../EquipmentCard/EquipmentCard";

interface SelectedEquipmentPanelProps {
    isOpen: boolean;
    onTogglePanel: () => void;
    onClosePanel: () => void;
    resolvedSelectedEquipmentItems: ResolvedSelectedEquipmentItem[];
    processingId: number | null;
    currentUser: User | null;
    onToggleEquipment: (type: EquipmentType, id: number, isAdded: boolean) => void;
}

const SelectedEquipmentPanel: React.FC<SelectedEquipmentPanelProps> = ({
    isOpen,
    onTogglePanel,
    onClosePanel,
    resolvedSelectedEquipmentItems,
    processingId,
    currentUser,
    onToggleEquipment,
}) => {
    return (
        <div className={`route-equipment-editor-selected-equipment-panel ${isOpen ? 'route-equipment-editor-selected-equipment-open' : 'route-equipment-editor-selected-equipment-closed'}`}>
            <div
                className="route-equipment-editor-selected-equipment-header"
                onClick={onTogglePanel}
            >
                <div className="route-equipment-editor-selected-equipment-header-content">
                    <div>
                        <h2 className="route-equipment-editor-selected-equipment-title">
                            Vybrané vybavení
                            <ChevronUp size={20} className={`route-equipment-editor-chevron ${isOpen ? 'route-equipment-editor-chevron-open' : ''}`} />
                        </h2>
                        <p className="route-equipment-editor-selected-equipment-subtitle">
                            {resolvedSelectedEquipmentItems.length} položek
                            {!isOpen && <span className="route-equipment-editor-selected-equipment-hint">(Klikni pro otevření)</span>}
                        </p>
                    </div>
                </div>
                {isOpen && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onClosePanel(); }}
                        className="route-equipment-editor-selected-equipment-close-btn"
                    >
                        <X size={24} />
                    </button>
                )}
            </div>

            <div className="route-equipment-editor-selected-equipment-list">
                {resolvedSelectedEquipmentItems.length === 0 ? (
                    <div className="route-equipment-editor-selected-equipment-empty">
                        <p className="route-equipment-editor-selected-equipment-empty-text">Zatím nemáte vybrané vybavení.</p>
                        <button
                            onClick={onClosePanel}
                            className="route-equipment-editor-selected-equipment-add-btn"
                        >
                            Přidat vybavení
                        </button>
                    </div>
                ) : (
                    resolvedSelectedEquipmentItems.map(({ pivotId, displayItem, equipmentType, equipmentId }) => (
                        <EquipmentCard
                            key={pivotId}
                            item={displayItem}
                            type={equipmentType}
                            isAdded={true}
                            isProcessing={processingId === equipmentId}
                            onToggle={(t, id) => onToggleEquipment(t, id, true)}
                            variant="compact"
                            currentUser={currentUser}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default SelectedEquipmentPanel;
