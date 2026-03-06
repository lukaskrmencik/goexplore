import React from 'react';
import { Save, Loader2 } from 'lucide-react';
import './PersonalDataForm.css';
import type { User } from '../../../../../types/users';

interface PersonalDataFormProps {
    user: User | null;
    name: string;
    isSaving: boolean;
    onNameChange: (name: string) => void;
    onSave: (e: React.FormEvent) => void;
}

{/* --- START: AI-GENERATED UI (Gemini 3.1 Pro) --- */}
{/* Layout and structure generated from design. Data binding and variables added manually. */}

const PersonalDataForm: React.FC<PersonalDataFormProps> = ({
    user,
    name,
    isSaving,
    onNameChange,
    onSave,
}) => (
    <div className="account-editor-card">
        <h3>Osobní údaje</h3>
        <form onSubmit={onSave} className="account-editor-form">
            <div className="account-form-group">
                <label>Jméno</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => onNameChange(e.target.value)}
                    required
                    className="account-input"
                />
            </div>
            <div className="account-form-group">
                <label>E-mail</label>
                <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    title="E-mail nelze změnit"
                    className="account-input account-input-disabled"
                />
            </div>
            <button
                type="submit"
                className="account-save-btn"
                disabled={isSaving || name === user?.name}
            >
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {isSaving ? "Ukládání..." : "Uložit změny"}
            </button>
        </form>
    </div>
);

{/* --- END: AI-GENERATED UI --- */}

export default PersonalDataForm;
