import React from 'react';
import { Check, Camera, Upload } from 'lucide-react';
import './EquipmentDetailsForm.css';
import type { GeneralEquipment } from '../../../../../../types/equipment';

interface EquipmentDetailsFormProps {
    selectedPattern: GeneralEquipment | null;
    name: string;
    specs: Record<string, unknown>;
    previewUrl: string | null;
    onNameChange: (name: string) => void;
    onSpecChange: (key: string, value: string) => void;
    onSpecBooleanChange: (key: string, checked: boolean) => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}


{/* --- START: AI-GENERATED UI (Gemini 3.1 Pro) --- */}
{/* Layout and structure generated from design. Data binding and variables added manually. */}

const EquipmentDetailsForm: React.FC<EquipmentDetailsFormProps> = ({
    selectedPattern,
    name,
    specs,
    previewUrl,
    onNameChange,
    onSpecChange,
    onSpecBooleanChange,
    onFileChange,
}) => (
    <div className="create-equipment-details-split">
        <div className="create-equipment-image-pane">
            <label className="create-equipment-image-upload">
                <div className={`create-equipment-image-area ${previewUrl ? 'has-image' : ''}`}>
                    {previewUrl ? (
                        <>
                            <img src={previewUrl} alt="Preview" className="create-equipment-preview-img" />
                            <div className="create-equipment-preview-overlay">
                                <Camera size={20} strokeWidth={2.5} />
                                <span>Změnit fotku</span>
                            </div>
                        </>
                    ) : (
                        <div className="create-equipment-empty-state">
                            <Upload size={32} strokeWidth={2} className="create-equipment-empty-icon" />
                            <span className="create-equipment-empty-text">Nahrát fotku</span>
                            <span className="create-equipment-empty-hint">JPG, PNG (max 2MB)</span>
                        </div>
                    )}
                </div>
                <input
                    type="file"
                    style={{ display: 'none' }}
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={onFileChange}
                />
            </label>
        </div>

        <div className="create-equipment-form-pane">
            <div className="create-equipment-name-group">
                <label className="create-equipment-input-label">Název vybavení</label>
                <div className="create-equipment-name-input-wrapper">
                    <input
                        type="text"
                        placeholder={`Např. Můj ${selectedPattern?.name?.toLowerCase()}`}
                        value={name}
                        onChange={(e) => onNameChange(e.target.value)}
                        className="create-equipment-name-input"
                        autoFocus
                    />
                </div>
            </div>

            <div className="create-equipment-specs-section">
                <div className="create-equipment-specs-grid">
                    {selectedPattern?.specifications_keys &&
                        Object.entries(selectedPattern.specifications_keys).map(([key, type]) => (
                            <div key={key} className="create-equipment-spec-group">
                                <label className="create-equipment-input-label">
                                    {key.replace(/_/g, ' ')}
                                </label>
                                {type === 'boolean' ? (
                                    <label className="create-equipment-boolean-label">
                                        <span className="create-equipment-boolean-text">
                                            {specs[key] ? 'Ano' : 'Ne'}
                                        </span>
                                        <div className={`create-equipment-boolean-switch ${specs[key] ? 'create-equipment-boolean-switch-on' : 'create-equipment-boolean-switch-off'}`}>
                                            <input
                                                type="checkbox"
                                                checked={!!specs[key]}
                                                onChange={(e) => onSpecBooleanChange(key, e.target.checked)}
                                                className="create-equipment-boolean-input"
                                            />
                                            <div className={`create-equipment-boolean-thumb ${specs[key] ? 'create-equipment-boolean-thumb-on' : 'create-equipment-boolean-thumb-off'}`} />
                                        </div>
                                    </label>
                                ) : (
                                    <div className="create-equipment-input-wrapper">
                                        <input
                                            type={type === 'integer' || type === 'numeric' ? 'number' : 'text'}
                                            value={String(specs[key] ?? '')}
                                            onChange={(e) => onSpecChange(key, e.target.value)}
                                            className="create-equipment-input"
                                            placeholder={
                                                selectedPattern?.general_specifications?.[key]
                                                    ? String(selectedPattern.general_specifications[key])
                                                    : "-"
                                            }
                                        />
                                    </div>
                                )}
                            </div>
                        ))
                    }
                </div>
                {(!selectedPattern?.specifications_keys ||
                    Object.keys(selectedPattern.specifications_keys).length === 0) && (
                    <div className="create-equipment-no-specs">
                        <div className="create-equipment-no-specs-icon"><Check size={24} /></div>
                        Toto vybavení nemá žádné parametry.
                    </div>
                )}
            </div>
        </div>
    </div>
);

{/* --- END: AI-GENERATED UI --- */}

export default EquipmentDetailsForm;
