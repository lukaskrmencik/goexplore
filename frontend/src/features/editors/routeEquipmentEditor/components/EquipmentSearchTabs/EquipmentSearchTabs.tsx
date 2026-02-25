import { Search, Package, User } from "lucide-react";
import type { EquipmentType } from "../../../../../types/equipment";

interface EquipmentSearchTabsProps {
    search: string;
    onSearchChange: (value: string) => void;
    activeTab: EquipmentType;
    onTabChange: (tab: EquipmentType) => void;
}

const EquipmentSearchTabs: React.FC<EquipmentSearchTabsProps> = ({
    search,
    onSearchChange,
    activeTab,
    onTabChange,
}) => {
    return (
        <div className="route-equipment-editor-warehouse-header">
            <div className="route-equipment-editor-warehouse-title-row">
                <h2 className="route-equipment-editor-warehouse-title">Výběr vybavení</h2>
            </div>

            <div className="route-equipment-editor-search-row">
                <div className="route-equipment-editor-search-wrapper">
                    <Search className="route-equipment-editor-search-icon" size={18} />
                    <input
                        type="text"
                        placeholder="Hledat vybavení..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="route-equipment-editor-search-input"
                    />
                </div>
            </div>

            <div className="route-equipment-editor-tabs">
                <button
                    onClick={() => onTabChange('general')}
                    className={`route-equipment-editor-tab-btn ${activeTab === 'general' ? 'route-equipment-editor-tab-active' : 'route-equipment-editor-tab-inactive'}`}
                >
                    <Package size={16} className="route-equipment-editor-tab-icon" />
                    <span className="route-equipment-editor-tab-text-desktop">Katalog</span>
                    <span className="route-equipment-editor-tab-text-mobile">Katalog</span>
                </button>
                <button
                    onClick={() => onTabChange('my')}
                    className={`route-equipment-editor-tab-btn ${activeTab === 'my' ? 'route-equipment-editor-tab-active' : 'route-equipment-editor-tab-inactive'}`}
                >
                    <User size={16} className="route-equipment-editor-tab-icon" />
                    <span className="route-equipment-editor-tab-text-desktop">Moje vybavení</span>
                    <span className="route-equipment-editor-tab-text-mobile">Moje</span>
                </button>
            </div>
        </div>
    );
};

export default EquipmentSearchTabs;
