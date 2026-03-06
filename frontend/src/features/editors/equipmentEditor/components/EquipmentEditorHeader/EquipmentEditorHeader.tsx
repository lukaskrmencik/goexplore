import React from 'react';
import { Search, Plus } from 'lucide-react';
import './EquipmentEditorHeader.css';
import { Input } from '../../../../../components/ui/Input/Input';

interface EquipmentEditorHeaderProps {
    search: string;
    onSearchChange: (value: string) => void;
    onCreateNew: () => void;
}

{/* --- START: AI-GENERATED UI (Gemini 3.1 Pro) --- */}
{/* Layout and structure generated from design. Data binding and variables added manually. */}

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
                placeholder="Hledat moje vybavení..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
            />
        </div>
        <div className="equipment-editor-actions-container">
            <button onClick={onCreateNew} className="equipment-editor-create-btn">
                <span className="equipment-editor-create-btn-icon-wrapper">
                    <Plus size={32} />
                </span>
                <span className="equipment-editor-create-btn-text">Přidat vybavení</span>
            </button>
        </div>
    </div>
);

{/* --- END: AI-GENERATED UI --- */}

export default EquipmentEditorHeader;
