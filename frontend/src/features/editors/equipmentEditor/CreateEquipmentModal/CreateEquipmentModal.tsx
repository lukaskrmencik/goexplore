import React, { useState, useEffect } from 'react';
import { X, Check, Dumbbell, AlertTriangle, Camera, Upload, Loader2 } from 'lucide-react';
import type { GeneralEquipment, MyEquipment } from '../../../../types/equipment';
import { fetchGeneralEquipment, createMyEquipment, updateMyEquipment, uploadEquipmentImage } from '../../../../services/equipmentApiService';
import { getImageUrl } from '../../../../utils/imageUrl';
import Toast from '../../../../components/ui/Toast/Toast';
import './CreateEquipmentModal.css';

const EQUIPMENT_IMAGE_MAX_SIZE_MB = Number(import.meta.env.VITE_EQUIPMENT_IMAGE_MAX_SIZE_MB ?? "2");
const EQUIPMENT_SEARCH_DEBOUNCE = Number(import.meta.env.VITE_EQUIPMENT_SEARCH_DEBOUNCE ?? "300");

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

    // Pagination for Catalog
    const [patternPage, setPatternPage] = useState(1);
    const [patternTotalPages, setPatternTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

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
            loadPatterns(1, '');
            resetForm();
            setSearchTerm('');
            setPatternPage(1);
        }
    }, [isOpen]);

    // Handle search debounce
    useEffect(() => {
        if (!isOpen) return;
        const delayDebounceFn = setTimeout(() => {
            if (isOpen) {
                loadPatterns(1, searchTerm);
            }
        }, EQUIPMENT_SEARCH_DEBOUNCE);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, isOpen]);

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

                if (initialData.img) {
                    setPreviewUrl(getImageUrl(initialData.img));
                }
            }
        }
    }, [isOpen, initialData, generalEquipment]);


    // --- Helpers ---
    const loadPatterns = async (pageToLoad: number, searchQ: string) => {
        setIsLoadingPatterns(true);
        try {
            const response = await fetchGeneralEquipment(pageToLoad, searchQ);
            setGeneralEquipment(response.data || []);
            setPatternPage(response.meta?.current_page || 1);
            setPatternTotalPages(Math.ceil((response.meta?.total || 0) / (response.meta?.per_page || 15)) || 1);
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
            const maxSizeBytes = EQUIPMENT_IMAGE_MAX_SIZE_MB * 1024 * 1024;
            if (file.size > maxSizeBytes) {
                setToast({ message: `Obrázek je příliš velký. Maximální velikost je ${EQUIPMENT_IMAGE_MAX_SIZE_MB} MB.`, type: "error" });
                e.target.value = ''; // Reset input
                return;
            }

            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // Helper to generate pagination numbers
    const getPageNumbers = () => {
        const pages = [];
        let start = Math.max(1, patternPage - 2);
        let end = Math.min(patternTotalPages, patternPage + 2);

        if (end - start < 4) {
            if (start === 1) {
                end = Math.min(patternTotalPages, start + 4);
            } else if (end === patternTotalPages) {
                start = Math.max(1, end - 4);
            }
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
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
                            {step === 'select' ? 'Katalog vybavení' : (initialData ? 'Upravit vybavení' : 'Detaily vybavení')}
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
                        <div className="create-equipment-modal-select-view">
                            <div className="create-equipment-modal-search-wrapper">
                                <input
                                    type="text"
                                    placeholder="Hledat šablony (např. Stan, Vařič)..."
                                    className="create-equipment-modal-search-input"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            {isLoadingPatterns ? (
                                <div className="create-equipment-modal-patterns-loading">
                                    <div className="create-equipment-modal-spinner"></div>
                                    <span>Načítám katalog...</span>
                                </div>
                            ) : (
                                <>
                                    <div className="create-equipment-modal-pattern-grid">
                                        {generalEquipment.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => handlePatternSelect(item)}
                                                className="create-equipment-modal-pattern-card"
                                            >
                                                <div className="create-equipment-modal-pattern-card-icon">
                                    {item.img ? (
                                        <img
                                            src={getImageUrl(item.img) ?? undefined}
                                            alt={item.name}
                                        />
                                                    ) : (
                                                        <Dumbbell size={28} strokeWidth={2.5} />
                                                    )}
                                                </div>
                                                <div className="create-equipment-modal-pattern-card-info">
                                                    <h3 className="create-equipment-modal-pattern-card-name">{item.name}</h3>
                                                    {item.general_specifications && Object.keys(item.general_specifications).length > 0 ? (
                                                        <div className="create-equipment-modal-pattern-card-specs">
                                                            {Object.entries(item.general_specifications).slice(0, 3).map(([key, value]) => (
                                                                <span key={key} className="create-equipment-modal-pattern-card-spec-badge">
                                                                    {key.replace(/_/g, ' ')}: {String(value)}
                                                                </span>
                                                            ))}
                                                            {Object.keys(item.general_specifications).length > 3 && (
                                                                <span className="create-equipment-modal-pattern-card-spec-badge">
                                                                    +{Object.keys(item.general_specifications).length - 3} další
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="create-equipment-modal-pattern-card-meta">
                                                            Vlastní specifikace
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                        {generalEquipment.length === 0 && (
                                            <div className="create-equipment-modal-no-results">
                                                Žádné šablony odpovídající hledání.
                                            </div>
                                        )}
                                    </div>

                                    {/* Pagination */}
                                    {patternTotalPages > 1 && generalEquipment.length > 0 && (
                                        <div className="equipment-editor-pagination">
                                            <button
                                                onClick={() => loadPatterns(Math.max(1, patternPage - 1), searchTerm)}
                                                disabled={patternPage === 1}
                                                className="equipment-editor-page-btn"
                                            >
                                                Předchozí
                                            </button>

                                            <div className="equipment-editor-page-numbers">
                                                {getPageNumbers().map(num => (
                                                    <button
                                                        key={num}
                                                        onClick={() => loadPatterns(num, searchTerm)}
                                                        className={`equipment-editor-num-btn ${patternPage === num ? 'equipment-editor-num-btn-active' : 'equipment-editor-num-btn-inactive'}`}
                                                    >
                                                        {num}
                                                    </button>
                                                ))}
                                            </div>

                                            <button
                                                onClick={() => loadPatterns(Math.min(patternTotalPages, patternPage + 1), searchTerm)}
                                                disabled={patternPage === patternTotalPages}
                                                className="equipment-editor-page-btn"
                                            >
                                                Další
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="create-equipment-modal-details-split">

                            {/* Left Column: Image Upload */}
                            <div className="create-equipment-modal-image-pane">
                                <label className="create-equipment-modal-image-upload">
                                    <div className={`create-equipment-modal-image-area ${previewUrl ? 'has-image' : ''}`}>
                                        {previewUrl ? (
                                            <>
                                                <img src={previewUrl} alt="Preview" className="create-equipment-modal-preview-img" />
                                                <div className="create-equipment-modal-preview-overlay">
                                                    <Camera size={20} strokeWidth={2.5} />
                                                    <span>Změnit fotku</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="create-equipment-modal-empty-state">
                                                <Upload size={32} strokeWidth={2} className="create-equipment-modal-empty-icon" />
                                                <span className="create-equipment-modal-empty-text">Nahrát fotku</span>
                                                <span className="create-equipment-modal-empty-hint">JPG, PNG (max 2MB)</span>
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
                            </div>

                            {/* Right Column: Form Fields */}
                            <div className="create-equipment-modal-form-pane">

                                <div className="create-equipment-modal-name-group">
                                    <label className="create-equipment-modal-input-label">Název vybavení</label>
                                    <div className="create-equipment-modal-name-input-wrapper">
                                        <input
                                            type="text"
                                            placeholder={`Např. Můj ${selectedPattern?.name?.toLowerCase()}`}
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="create-equipment-modal-name-input"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="create-equipment-modal-specs-section">
                                    <div className="create-equipment-modal-specs-grid">
                                        {selectedPattern?.specifications_keys && Object.entries(selectedPattern.specifications_keys).map(([key, type]) => (
                                            <div key={key} className="create-equipment-modal-spec-group">
                                                <label className="create-equipment-modal-input-label">
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
                                            Toto vybavení nemá žádné parametry.
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
                                <span>{initialData ? 'Uložit změny' : 'Vytvořit vybavení'}</span>
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
