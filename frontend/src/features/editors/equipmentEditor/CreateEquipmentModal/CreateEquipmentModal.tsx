import React, { useState, useEffect } from 'react';
import { X, Check, Dumbbell, AlertTriangle, Camera, Upload, Loader2 } from 'lucide-react';
import type { GeneralEquipment, MyEquipment } from '../../../../types/equipment';
import { fetchGeneralEquipment, createMyEquipment, updateMyEquipment, uploadEquipmentImage } from '../../../../services/equipmentApiService';
import Toast from '../../../../components/ui/Toast/Toast';
import './CreateEquipmentModal.css';

interface CreateEquipmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (newEquipment: MyEquipment) => void;
    initialData?: MyEquipment | null;
}

const CreateEquipmentModal: React.FC<CreateEquipmentModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    // --- State ---
    const [step, setStep] = useState<'select' | 'details'>('select');
    const [selectedPattern, setSelectedPattern] = useState<GeneralEquipment | null>(null);
    const [generalEquipment, setGeneralEquipment] = useState<GeneralEquipment[]>([]);
    const [isLoadingPatterns, setIsLoadingPatterns] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [specs, setSpecs] = useState<Record<string, any>>({});
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // --- Effects ---
    useEffect(() => {
        if (isOpen) {
            loadPatterns();
            resetForm();
        }
    }, [isOpen]);

    // Handle initial data changes (e.g. when opening edit mode)
    useEffect(() => {
        if (isOpen && initialData && generalEquipment.length > 0) {
            // Find pattern
            const pattern = generalEquipment.find(g => g.id === initialData.general_equipment_id);
            if (pattern) {
                setStep('details');
                setSelectedPattern(pattern);
                setName(initialData.name);

                // Sanitize specifications (Fix for "unknown key 0" error if array)
                let initialSpecs = initialData.specifications || {};
                if (Array.isArray(initialSpecs)) {
                    initialSpecs = {};
                }

                // Merge with pattern defaults to ensure all keys exist and have correct types
                const mergedSpecs: Record<string, any> = {};
                if (pattern.specifications_keys) {
                    Object.entries(pattern.specifications_keys).forEach(([key, type]) => {
                        // Default values based on General Equipment specs if available
                        if (pattern.general_specifications && pattern.general_specifications[key] !== undefined && pattern.general_specifications[key] !== null) {
                            mergedSpecs[key] = pattern.general_specifications[key];
                        }
                        // Fallback to type-based defaults
                        else if (type === 'integer' || type === 'numeric') {
                            // Valid default is empty string to force user input if no general spec
                            mergedSpecs[key] = '';
                        } else if (type === 'boolean') {
                            mergedSpecs[key] = false;
                        } else {
                            mergedSpecs[key] = '';
                        }
                    });
                }

                // Override defaults with actual values from initialData
                Object.keys(initialSpecs).forEach(key => {
                    if (mergedSpecs.hasOwnProperty(key)) {
                        mergedSpecs[key] = initialSpecs[key];
                    }
                });

                setSpecs(mergedSpecs);

                // Set preview if image exists
                if (initialData.img) {
                    setPreviewUrl(`https://goexplore.lukaskrmencik.cz/php/storage/${initialData.img}`);
                }
            }
        }
    }, [isOpen, initialData, generalEquipment]);


    // --- Helpers ---
    const loadPatterns = async () => {
        setIsLoadingPatterns(true);
        try {
            const response = await fetchGeneralEquipment(1, '');
            setGeneralEquipment(response.data || []);
        } catch (err) {
            console.error("Failed to load equipment patterns", err);
            setToast({ message: "Nepodařilo se načíst seznam vybavení.", type: "error" });
        } finally {
            setIsLoadingPatterns(false);
        }
    };

    const resetForm = () => {
        setStep(initialData ? 'details' : 'select');
        setSelectedPattern(null);
        setName('');
        setSpecs({});
        setImageFile(null);
        setPreviewUrl(null);
        setError(null);
        setToast(null);
    };

    const handlePatternSelect = (pattern: GeneralEquipment) => {
        setSelectedPattern(pattern);
        setStep('details');
        const initialSpecs: Record<string, any> = {};
        if (pattern.specifications_keys) {
            Object.entries(pattern.specifications_keys).forEach(([key, type]) => {
                // Use default value from General Equipment if available
                if (pattern.general_specifications && pattern.general_specifications[key] !== undefined && pattern.general_specifications[key] !== null) {
                    initialSpecs[key] = pattern.general_specifications[key];
                }
                // Fallback to type-based defaults
                else if (type === 'integer' || type === 'numeric') {
                    // Start as empty string to force validation
                    initialSpecs[key] = '';
                } else if (type === 'boolean') {
                    initialSpecs[key] = false;
                } else {
                    initialSpecs[key] = '';
                }
            });
        }
        setSpecs(initialSpecs);
    };

    const handleSpecChange = (key: string, value: string) => {
        // Store raw string value to allow validation of empty fields
        setSpecs(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const validateForm = () => {
        if (!name.trim()) return "Zadejte název vybavení.";
        if (!selectedPattern) return "Vyberte typ vybavení.";

        // Validate required specifications
        if (selectedPattern.specifications_keys) {
            for (const [key, type] of Object.entries(selectedPattern.specifications_keys)) {
                const val = specs[key];

                // Skip validation for booleans (defaults to false)
                if (type === 'boolean') continue;

                // Validate everything else (string, integer, numeric)
                if (val === undefined || val === null || String(val).trim() === '') {
                    return `Vyplňte hodnotu pro: ${key.replace(/_/g, ' ')}`;
                }
            }
        }
        return null;
    };

    const handleSubmit = async () => {
        const validationError = validateForm();
        if (validationError) {
            setToast({ message: validationError, type: 'error' });
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            if (!selectedPattern) throw new Error("No pattern selected");

            // Prepare specs with correct types
            const preparedSpecs = { ...specs };
            if (selectedPattern?.specifications_keys) {
                Object.entries(selectedPattern.specifications_keys).forEach(([key, type]) => {
                    const val = preparedSpecs[key];
                    if (type === 'integer') {
                        preparedSpecs[key] = parseInt(val) || 0;
                    } else if (type === 'numeric') {
                        preparedSpecs[key] = parseFloat(val) || 0;
                    }
                });
            }

            let savedEquipment: MyEquipment;

            if (initialData) {
                savedEquipment = await updateMyEquipment(initialData.id, {
                    name,
                    specifications: preparedSpecs
                });
            } else {
                savedEquipment = await createMyEquipment({
                    name,
                    general_equipment_id: selectedPattern.id,
                    specifications: preparedSpecs
                });
            }

            // Upload image if selected
            if (imageFile) {
                await uploadEquipmentImage(savedEquipment.id, imageFile);
            }

            onSubmit(savedEquipment);
            onClose();
            setToast({ message: "Vybavení bylo uloženo.", type: "success" });
        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.message || err.response?.data?.error_message || "Nepodařilo se uložit vybavení.";

            // Handle Laravel Validation Errors (errors object)
            let finalMsg = msg;
            if (err.response?.data?.errors) {
                const firstError = Object.values(err.response.data.errors)[0];
                if (Array.isArray(firstError)) finalMsg = firstError[0];
                else if (typeof firstError === 'string') finalMsg = firstError;
            }

            setToast({ message: finalMsg, type: "error" });

            // Specific check for PHP upload failure
            if (err.response?.data?.error_message === 'The image failed to upload.') {
                setToast({ message: "Obrázek je pravděpodobně příliš velký (limit serveru). Zkuste menší soubor.", type: "error" });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (2MB limit = 2 * 1024 * 1024)
            if (file.size > 2 * 1024 * 1024) {
                setToast({ message: "Obrázek je příliš velký. Maximální velikost je 2 MB.", type: "error" });
                e.target.value = ''; // Reset input
                return;
            }

            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // --- Render ---

    if (!isOpen) return null;

    return (
        <div className="create-equipment-modal-backdrop">
            <div className="create-equipment-modal-content">

                {/* Header */}
                <div className="create-equipment-modal-header">
                    <div className="create-equipment-modal-title-wrapper">
                        <h2 className="create-equipment-modal-title">
                            {step === 'select' ? 'Nové vybavení' : (initialData ? 'Upravit vybavení' : 'Detaily vybavení')}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="create-equipment-modal-close-btn"
                    >
                        <X size={24} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Content Area */}
                <div className="create-equipment-modal-body">
                    {error && (
                        <div className="create-equipment-modal-error">
                            <AlertTriangle size={16} strokeWidth={2.5} />
                            <span>{error}</span>
                        </div>
                    )}

                    {step === 'select' ? (
                        <div className="create-equipment-modal-select-grid">
                            {isLoadingPatterns ? (
                                <div className="create-equipment-modal-patterns-loading">
                                    <div className="create-equipment-modal-spinner"></div>
                                    <span>Načítám šablony...</span>
                                </div>
                            ) : (
                                generalEquipment?.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handlePatternSelect(item)}
                                        className="create-equipment-modal-pattern-btn"
                                    >
                                        <div className="create-equipment-modal-pattern-icon-wrapper">
                                            {item.img ? (
                                                <img
                                                    src={`https://goexplore.lukaskrmencik.cz/php/storage/${item.img}`}
                                                    alt={item.name}
                                                    className="create-equipment-modal-pattern-image"
                                                />
                                            ) : (
                                                <Dumbbell size={24} strokeWidth={2.5} />
                                            )}
                                        </div>
                                        <h3 className="create-equipment-modal-pattern-name">{item.name}</h3>
                                        <div className="create-equipment-modal-pattern-specs">
                                            {item.specifications_keys ? Object.keys(item.specifications_keys).length : 0} vlastností
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="create-equipment-modal-details-container">
                            {/* Top Section: Image + Name (Mobile Stacked, Desktop Split) */}
                            <div className="create-equipment-modal-image-col">
                                {/* Image Upload */}
                                <label className="create-equipment-modal-image-upload">
                                    <div className={`create-equipment-modal-image-area ${previewUrl ? 'create-equipment-modal-image-area-with-preview' : 'create-equipment-modal-image-area-empty'}`}>
                                        {previewUrl ? (
                                            <>
                                                <img src={previewUrl} alt="Preview" className="create-equipment-modal-preview-img" />
                                                <div className="create-equipment-modal-preview-overlay">
                                                    <div className="create-equipment-modal-preview-action">
                                                        <Camera size={18} strokeWidth={2.5} />
                                                        <span className="create-equipment-modal-preview-action-text">Změnit</span>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="create-equipment-modal-empty-state">
                                                <div className="create-equipment-modal-upload-icon-wrapper">
                                                    <Upload size={32} strokeWidth={2} />
                                                </div>
                                                <span className="create-equipment-modal-upload-title">Nahrát fotku</span>
                                                <span className="create-equipment-modal-upload-title-mobile">Nahrát fotku</span>
                                                <p className="create-equipment-modal-upload-hint">Platné soubory: JPG, PNG<br />(max 2MB)</p>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        style={{ display: 'none' }}
                                        accept="image/png, image/jpeg, image/jpg"
                                        onChange={handleFileChange}
                                    />
                                </label>

                                {/* Name Input (Mobile: Under Image, Desktop: In right Col) */}
                                <div className="create-equipment-modal-name-mobile">
                                    <label className="create-equipment-modal-name-label-mobile">Název vybavení</label>
                                    <div className="create-equipment-modal-name-input-wrapper-mobile">
                                        <input
                                            type="text"
                                            placeholder={`Např. Můj ${selectedPattern?.name?.toLowerCase()}`}
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="create-equipment-modal-name-input-mobile"
                                            autoFocus
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Form Fields */}
                            <div className="create-equipment-modal-form-col">
                                {/* Desktop Name Input */}
                                <div className="create-equipment-modal-name-desktop">
                                    <h3 className="create-equipment-modal-section-title">
                                        <span className="create-equipment-modal-section-number">01</span>
                                        Základní informace
                                        <div className="create-equipment-modal-section-line" />
                                    </h3>
                                    <div className="create-equipment-modal-name-input-wrapper-desktop">
                                        <div className="create-equipment-modal-name-label-desktop">Název vybavení</div>
                                        <input
                                            type="text"
                                            placeholder={`Např. Můj ${selectedPattern?.name?.toLowerCase()}`}
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="create-equipment-modal-name-input-desktop"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="create-equipment-modal-specs-section">
                                    {/* Mobile Heading for Specs */}
                                    <h3 className="create-equipment-modal-section-title">
                                        <div className="create-equipment-modal-section-title-mobile-wrap">
                                            <span className="create-equipment-modal-section-number">
                                                <span className="create-equipment-modal-section-number-desktop">02</span>
                                                <span className="create-equipment-modal-section-number-mobile">Parametry</span>
                                            </span>
                                            <span className="create-equipment-modal-section-title-text-desktop">
                                                Technické parametry
                                            </span>
                                        </div>
                                        <div className="create-equipment-modal-section-line" />
                                    </h3>

                                    <div className="create-equipment-modal-specs-grid">
                                        {selectedPattern?.specifications_keys && Object.entries(selectedPattern.specifications_keys).map(([key, type]) => (
                                            <div key={key} className="create-equipment-modal-spec-group">
                                                <label className="create-equipment-modal-spec-label">
                                                    {key.replace(/_/g, ' ')}
                                                </label>
                                                {type === 'boolean' ? (
                                                    <label className="create-equipment-modal-boolean-label">
                                                        <span className="create-equipment-modal-boolean-text">{specs[key] ? 'Ano' : 'Ne'}</span>
                                                        <div className={`create-equipment-modal-boolean-switch ${specs[key] ? 'create-equipment-modal-boolean-switch-on' : 'create-equipment-modal-boolean-switch-off'}`}>
                                                            <input
                                                                type="checkbox"
                                                                checked={!!specs[key]}
                                                                onChange={(e) => setSpecs(prev => ({ ...prev, [key]: e.target.checked }))}
                                                                className="create-equipment-modal-boolean-input"
                                                            />
                                                            <div className={`create-equipment-modal-boolean-thumb ${specs[key] ? 'create-equipment-modal-boolean-thumb-on' : 'create-equipment-modal-boolean-thumb-off'}`} />
                                                        </div>
                                                    </label>
                                                ) : (
                                                    <div className="create-equipment-modal-input-wrapper">
                                                        <input
                                                            type={type === 'integer' || type === 'numeric' ? 'number' : 'text'}
                                                            value={specs[key] || ''}
                                                            onChange={(e) => handleSpecChange(key, e.target.value)}
                                                            className="create-equipment-modal-input"
                                                            placeholder={selectedPattern?.general_specifications?.[key] ? String(selectedPattern.general_specifications[key]) : "-"}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {(!selectedPattern?.specifications_keys || Object.keys(selectedPattern.specifications_keys).length === 0) && (
                                        <div className="create-equipment-modal-no-specs">
                                            <div className="create-equipment-modal-no-specs-icon"><Check size={24} /></div>
                                            Toto vybavení nemá žádné další parametry.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="create-equipment-modal-footer">
                    <div className="create-equipment-modal-footer-actions">
                        <button
                            type="button"
                            onClick={onClose}
                            className="create-equipment-modal-cancel-btn"
                        >
                            Zrušit
                        </button>
                        {step === 'details' && (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting || !name.trim()}
                                className="create-equipment-modal-submit-btn"
                            >
                                {isSubmitting ? <span className="create-equipment-modal-spinner-icon"><Loader2 size={20} /></span> : <Check size={20} strokeWidth={3} />}
                                <span>{initialData ? 'Uložit' : 'Vytvořit'}</span>
                            </button>
                        )}
                    </div>
                </div>

            </div>

            {/* Toast Notifications */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );

};

export default CreateEquipmentModal;
