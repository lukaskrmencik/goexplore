import { ChevronUp, X } from "lucide-react";
import type { EquipmentType } from "../../../../../types/equipment";
import type { User } from "../../../../../types/users";
import type { ResolvedBackpackItem } from "../../hooks/useRouteEquipment";
import EquipmentCard from "../EquipmentCard/EquipmentCard";

interface BackpackPanelProps {
    isOpen: boolean;
    onTogglePanel: () => void;
    onClosePanel: () => void;
    resolvedBackpackItems: ResolvedBackpackItem[];
    processingId: number | null;
    currentUser: User | null;
    onToggleEquipment: (type: EquipmentType, id: number, isAdded: boolean) => void;
}

const BackpackPanel: React.FC<BackpackPanelProps> = ({
    isOpen,
    onTogglePanel,
    onClosePanel,
    resolvedBackpackItems,
    processingId,
    currentUser,
    onToggleEquipment,
}) => {
    return (
        <div className={`route-equipment-editor-backpack-panel ${isOpen ? 'route-equipment-editor-backpack-open' : 'route-equipment-editor-backpack-closed'}`}>
            <div
                className="route-equipment-editor-backpack-header"
                onClick={onTogglePanel}
            >
                <div className="route-equipment-editor-backpack-header-content">
                    <div>
                        <h2 className="route-equipment-editor-backpack-title">
                            Vybrané vybavení
                            <ChevronUp size={20} className={`route-equipment-editor-chevron ${isOpen ? 'route-equipment-editor-chevron-open' : ''}`} />
                        </h2>
                        <p className="route-equipment-editor-backpack-subtitle">
                            {resolvedBackpackItems.length} položek
                            {!isOpen && <span className="route-equipment-editor-backpack-hint">(Klikni pro otevření)</span>}
                        </p>
                    </div>
                </div>
                {isOpen && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onClosePanel(); }}
                        className="route-equipment-editor-backpack-close-btn"
                    >
                        <X size={24} />
                    </button>
                )}
            </div>

            <div className="route-equipment-editor-backpack-list">
                {resolvedBackpackItems.length === 0 ? (
                    <div className="route-equipment-editor-backpack-empty">
                        <p className="route-equipment-editor-backpack-empty-text">Zatím nemáte vybrané vybavení.</p>
                        <button
                            onClick={onClosePanel}
                            className="route-equipment-editor-backpack-add-btn"
                        >
                            Přidat vybavení
                        </button>
                    </div>
                ) : (
                    resolvedBackpackItems.map(({ pivotId, displayItem, equipmentType, equipmentId }) => (
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

export default BackpackPanel;
