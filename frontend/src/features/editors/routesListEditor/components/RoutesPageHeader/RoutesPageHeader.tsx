import { Search, LayoutGrid, Share2 } from "lucide-react";
import './RoutesPageHeader.css';
import { Input } from "../../../../../components/ui/Input/Input";

interface RoutesPageHeaderProps {
    activeTab: "owned" | "shared";
    onTabChange: (tab: "owned" | "shared") => void;
    searchValue: string;
    onSearchChange: (value: string) => void;
    ownedCount: number;
    sharedCount: number;
}

const RoutesPageHeader: React.FC<RoutesPageHeaderProps> = ({
    activeTab,
    onTabChange,
    searchValue,
    onSearchChange,
    ownedCount,
    sharedCount,
}) => {
    const title = activeTab === "shared" ? "Sdílené cesty" : "Moje cesty";

    return (
        <div className="routes-list-editor-header-wrapper">
            <h1 className="routes-list-editor-title">{title}</h1>

            <div className="routes-list-editor-search-wrapper">
                <Input
                    icon={Search}
                    placeholder={activeTab === "shared" ? "Hledat ve sdílených cestách..." : "Hledat v mých cestách..."}
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            <div className="routes-list-editor-tabs-container">
                <button
                    onClick={() => onTabChange("owned")}
                    className={`routes-list-editor-tab-btn ${activeTab === "owned" ? "routes-list-editor-tab-active-owned" : "routes-list-editor-tab-inactive"}`}
                >
                    <LayoutGrid size={16} />
                    Moje cesty
                    <span className={`routes-list-editor-tab-badge ${activeTab === "owned" ? "routes-list-editor-tab-badge-owned-active" : "routes-list-editor-tab-badge-inactive"}`}>
                        {ownedCount}
                    </span>
                </button>

                <button
                    onClick={() => onTabChange("shared")}
                    className={`routes-list-editor-tab-btn ${activeTab === "shared" ? "routes-list-editor-tab-active-shared" : "routes-list-editor-tab-inactive"}`}
                >
                    <Share2 size={16} />
                    Sdílené
                    <span className={`routes-list-editor-tab-badge ${activeTab === "shared" ? "routes-list-editor-tab-badge-shared-active" : "routes-list-editor-tab-badge-inactive"}`}>
                        {sharedCount}
                    </span>
                </button>
            </div>
        </div>
    );
};

export default RoutesPageHeader;
