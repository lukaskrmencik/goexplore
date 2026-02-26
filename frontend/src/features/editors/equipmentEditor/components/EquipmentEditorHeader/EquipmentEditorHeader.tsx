import React from 'react';
import { Search, Plus } from 'lucide-react';
import './EquipmentEditorHeader.css';
import { Input } from '../../../../../components/ui/Input/Input';

interface EquipmentEditorHeaderProps {
    search: string;
    onSearchChange: (value: string) => void;
    onCreateNew: () => void;
}

const EquipmentEditorHeader: React.FC<EquipmentEditorHeaderProps> = ({
    search,
    onSearchChange,
    onCreateNew,
}) => (
    <div className="equipment-editor-header-wrapper">
        <h1 className="equipment-editor-title">Moje vybavení</h1>
        <div className="equipment-editor-search-wrapper">
            <Input
                icon={Search}
                placeholder="Hledat vybavení..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
            />
        </div>
        <div className="equipment-editor-actions-container">
            <button onClick={onCreateNew} className="equipment-editor-create-btn">
                <Plus size={20} />
                Přidat vybavení
            </button>
        </div>
    </div>
);

export default EquipmentEditorHeader;
