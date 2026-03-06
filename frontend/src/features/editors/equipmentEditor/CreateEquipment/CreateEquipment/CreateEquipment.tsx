import React from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import type { MyEquipment } from '../../../../../types/equipment';
import { useCreateEquipment } from '../hooks/useCreateEquipment';
import PatternCatalog from '../components/PatternCatalog/PatternCatalog';
import EquipmentDetailsForm from '../components/EquipmentDetailsForm/EquipmentDetailsForm';
import Toast from '../../../../../components/ui/Toast/Toast';
import './CreateEquipment.css';

interface CreateEquipmentProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (newEquipment: MyEquipment) => void;
    initialData?: MyEquipment | null;
}

const CreateEquipment: React.FC<CreateEquipmentProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
}) => {
    const {
        step,
        selectedPattern,
        generalEquipment,
        isLoadingPatterns,
        patternPage,
        patternTotalPages,
        searchTerm,
        setSearchTerm,
        name,
        setName,
        specs,
        previewUrl,
        isSubmitting,
        toast,
        setToast,
        modalTitle,
        handlePatternSelect,
        handleSpecChange,
        handleSpecBooleanChange,
        handleSubmit,
        handleFileChange,
        loadPatterns,
    } = useCreateEquipment({ isOpen, onClose, onSubmit, initialData });

    if (!isOpen) return null;

    {/* --- START: AI-GENERATED UI (Gemini 3.1 Pro) --- */}
    {/* Layout and structure generated from design. Data binding and variables added manually. */}

    return (
        <div className="create-equipment-backdrop">
            <div className="create-equipment-content">
                <div className="create-equipment-header">
                    <div className="create-equipment-title-wrapper">
                        <h2 className="create-equipment-title">{modalTitle}</h2>
                    </div>
                    <button onClick={onClose} className="create-equipment-close-btn">
                        <X size={24} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="create-equipment-body">
                    {step === 'select' ? (
                        <PatternCatalog
                            generalEquipment={generalEquipment}
                            isLoadingPatterns={isLoadingPatterns}
                            searchTerm={searchTerm}
                            patternPage={patternPage}
                            patternTotalPages={patternTotalPages}
                            onSearchChange={setSearchTerm}
                            onPatternSelect={handlePatternSelect}
                            onPageChange={(page) => loadPatterns(page, searchTerm)}
                        />
                    ) : (
                        <EquipmentDetailsForm
                            selectedPattern={selectedPattern}
                            name={name}
                            specs={specs}
                            previewUrl={previewUrl}
                            onNameChange={setName}
                            onSpecChange={handleSpecChange}
                            onSpecBooleanChange={handleSpecBooleanChange}
                            onFileChange={handleFileChange}
                        />
                    )}
                </div>

                <div className="create-equipment-footer">
                    <div className="create-equipment-footer-actions">
                        <button type="button" onClick={onClose} className="create-equipment-cancel-btn">
                            Zrušit
                        </button>
                        {step === 'details' && (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting || !name.trim()}
                                className="create-equipment-submit-btn"
                            >
                                {isSubmitting
                                    ? <span className="create-equipment-spinner-icon"><Loader2 size={20} /></span>
                                    : <Check size={20} strokeWidth={3} />
                                }
                                <span>{initialData ? 'Uložit změny' : 'Vytvořit vybavení'}</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );

    {/* --- END: AI-GENERATED UI --- */}
};

export default CreateEquipment;
