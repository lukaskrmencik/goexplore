import React, { useState, useEffect } from 'react';
import { X, Check, Dumbbell, AlertTriangle, Camera, Upload, Loader2 } from 'lucide-react';
import type { GeneralEquipment, MyEquipment } from '../../../types/equipment';
import { fetchGeneralEquipment, createMyEquipment, updateMyEquipment, uploadEquipmentImage } from '../../../services/equipmentApiService';
import { Button } from '../../../components/ui/Button';
import Toast from '../../../components/ui/Toast';


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
                // We also need to ensure values match the expected type if they exist
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pt-16 pb-20 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 pointer-events-none">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-h-full sm:h-auto sm:max-h-[90vh] md:max-w-5xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 ring-1 ring-slate-900/5 pointer-events-auto">

                {/* Header */}
                <div className="px-5 py-4 sm:p-6 bg-white shrink-0 flex items-center justify-between border-b border-slate-100 sticky top-0 z-10">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl sm:text-2xl font-heading font-black text-slate-900 tracking-tight truncate">
                            {step === 'select' ? 'Nové vybavení' : (initialData ? 'Upravit vybavení' : 'Detaily vybavení')}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 sm:p-3 bg-slate-100 hover:bg-rose-50 rounded-full text-slate-500 hover:text-rose-600 transition-colors ml-4 shrink-0"
                    >
                        <X size={20} className="sm:w-6 sm:h-6" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-8 md:p-10">
                    {error && (
                        <div className="mb-4 sm:mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl flex items-center gap-3 font-medium animate-in slide-in-from-top-2 text-xs sm:text-sm shadow-sm">
                            <AlertTriangle size={18} className="shrink-0" />
                            {error}
                        </div>
                    )}

                    {step === 'select' ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pb-20">
                            {isLoadingPatterns ? (
                                <div className="col-span-full py-20 text-center text-slate-400 italic flex flex-col items-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-4"></div>
                                    Načítám šablony...
                                </div>
                            ) : (
                                generalEquipment?.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handlePatternSelect(item)}
                                        className="flex flex-col items-center text-center p-3 sm:p-6 bg-white border border-slate-200 shadow-sm rounded-xl sm:rounded-2xl hover:border-emerald-500 hover:ring-4 hover:ring-emerald-500/10 hover:shadow-xl hover:-translate-y-1 transition-all group duration-300"
                                    >
                                        <div className="h-12 w-12 sm:h-16 sm:w-16 bg-slate-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-slate-400 mb-2 sm:mb-4 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors border border-slate-100 group-hover:scale-110 duration-300">
                                            {item.img ? (
                                                <img
                                                    src={`https://goexplore.lukaskrmencik.cz/php/storage/${item.img}`}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover rounded-xl sm:rounded-2xl opacity-80 group-hover:opacity-100 transition-opacity"
                                                />
                                            ) : (
                                                <Dumbbell size={24} className="sm:w-8 sm:h-8" />
                                            )}
                                        </div>
                                        <div className="font-bold text-xs sm:text-lg text-slate-900 mb-1 sm:mb-2 group-hover:text-emerald-700 transition-colors leading-tight">{item.name}</div>
                                        <div className="text-[9px] sm:text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full uppercase tracking-wider">
                                            {item.specifications_keys ? Object.keys(item.specifications_keys).length : 0} vlastností
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-4 lg:gap-10 pb-4 sm:pb-0">
                            {/* Top Section: Image + Name (Mobile Stacked, Desktop Split) */}
                            <div className="flex flex-col lg:w-1/3 gap-4 shrink-0 items-center">
                                {/* Image Upload */}
                                <label className="block w-[200px] sm:w-[320px] relative group cursor-pointer lg:sticky lg:top-6 shrink-0">
                                    <div className={`
                                            w-full aspect-square rounded-2xl sm:rounded-[2rem] flex flex-col items-center justify-center overflow-hidden border-2 transition-all bg-white relative shadow-sm
                                            ${previewUrl ? 'border-emerald-500 shadow-xl ring-4 ring-emerald-500/10' : 'border-slate-200 border-dashed hover:border-emerald-400 hover:bg-emerald-50/30'}
                                        `}>
                                        {previewUrl ? (
                                            <>
                                                <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                                                <div className="absolute inset-x-0 bottom-0 top-auto h-1/3 bg-gradient-to-t from-black/70 to-transparent opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-end pb-4 sm:pb-6 text-white font-bold">
                                                    <div className="flex items-center gap-2 drop-shadow-md">
                                                        <Camera size={24} className="sm:w-8 sm:h-8" />
                                                        <span className="text-base sm:text-lg">Změnit</span>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center text-slate-400 group-hover:text-emerald-600 transition-colors">
                                                <div className="p-5 sm:p-8 bg-slate-50 rounded-3xl sm:mb-6 group-hover:bg-emerald-100 transition-colors border border-slate-100 group-hover:scale-110 duration-300 shadow-sm">
                                                    <Upload size={36} className="sm:w-16 sm:h-16" />
                                                </div>
                                                <span className="hidden sm:block font-heading font-black text-xl lg:text-2xl mt-2 tracking-tight">Nahrát fotku</span>
                                                <span className="text-sm sm:hidden font-bold uppercase tracking-wider mt-3">Nahrát fotku</span>
                                                <span className="hidden sm:block text-sm mt-3 text-slate-400 text-center px-6">Platné soubory: JPG, PNG<br />(max 2MB)</span>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/png, image/jpeg, image/jpg"
                                        onChange={handleFileChange}
                                    />
                                </label>

                                {/* Name Input (Mobile: Under Image, Desktop: In right Col) */}
                                <div className="w-full sm:hidden px-4">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">Název vybavení</label>
                                    <div className="bg-slate-50 rounded-xl border border-slate-200 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all p-1">
                                        <input
                                            type="text"
                                            placeholder={`Např. Můj ${selectedPattern?.name?.toLowerCase()}`}
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full py-2 bg-transparent outline-none text-xl font-black text-slate-900 placeholder:text-slate-300 text-center"
                                            autoFocus
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Form Fields */}
                            <div className="flex-1 space-y-6 sm:space-y-10">
                                {/* Desktop Name Input */}
                                <div className="hidden sm:block space-y-4">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-3 mb-6">
                                        <span className="bg-slate-100 px-2 py-1 rounded">01</span>
                                        Základní informace
                                        <div className="h-px bg-slate-200 flex-1" />
                                    </h3>
                                    <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all">
                                        <div className="px-4 pt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Název vybavení</div>
                                        <input
                                            type="text"
                                            placeholder={`Např. Můj ${selectedPattern?.name?.toLowerCase()}`}
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-4 pb-3 pt-1 bg-transparent outline-none text-xl font-bold text-slate-900 placeholder:text-slate-300"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3 sm:space-y-4">
                                    {/* Mobile Heading for Specs */}
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-3 mb-2 sm:mb-6">
                                        <span className="bg-slate-100 px-2 py-1 rounded sm:hidden">Parametry</span>
                                        <span className="hidden sm:inline bg-slate-100 px-2 py-1 rounded">02</span>
                                        <span className="hidden sm:inline">Technické parametry</span>
                                        <div className="h-px bg-slate-200 flex-1" />
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 sm:gap-y-6">
                                        {selectedPattern?.specifications_keys && Object.entries(selectedPattern.specifications_keys).map(([key, type]) => (
                                            <div key={key} className="group">
                                                <label className="block text-[10px] font-bold text-slate-400 mb-1 sm:mb-2 capitalize ml-1 group-focus-within:text-emerald-600 transition-colors flex items-center gap-2">
                                                    {key.replace(/_/g, ' ')}
                                                </label>
                                                {type === 'boolean' ? (
                                                    <label className="flex items-center justify-between p-3 sm:p-4 bg-white border border-slate-200 rounded-xl sm:rounded-2xl cursor-pointer hover:border-emerald-400 hover:shadow-md transition-all group-hover:-translate-y-0.5">
                                                        <span className="font-bold text-slate-700 text-sm pl-1">{specs[key] ? 'Ano' : 'Ne'}</span>
                                                        <div className={`
                                                                w-10 h-6 sm:w-12 sm:h-7 rounded-full relative transition-colors duration-200 border-2
                                                                ${specs[key] ? 'bg-emerald-500 border-emerald-500' : 'bg-slate-100 border-slate-200'}
                                                            `}>
                                                            <div className={`
                                                                    absolute top-0.5 left-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white shadow-sm transition-transform duration-200
                                                                    ${specs[key] ? 'translate-x-4 sm:translate-x-5' : 'translate-x-0'}
                                                                `} />
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            checked={!!specs[key]}
                                                            onChange={(e) => setSpecs(prev => ({ ...prev, [key]: e.target.checked }))}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                ) : (
                                                    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 overflow-hidden focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all shadow-sm">
                                                        <input
                                                            type={type === 'integer' || type === 'numeric' ? 'number' : 'text'}
                                                            value={specs[key] || ''}
                                                            onChange={(e) => handleSpecChange(key, e.target.value)}
                                                            className="w-full px-4 py-2 sm:px-5 sm:py-3 bg-transparent outline-none font-bold text-slate-700 placeholder:text-slate-300 text-sm sm:text-base"
                                                            placeholder={selectedPattern?.general_specifications?.[key] ? String(selectedPattern.general_specifications[key]) : "-"}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {(!selectedPattern?.specifications_keys || Object.keys(selectedPattern.specifications_keys).length === 0) && (
                                        <div className="p-8 bg-slate-100/50 rounded-2xl text-slate-400 text-sm font-medium text-center border-2 border-dashed border-slate-200 flex flex-col items-center">
                                            <div className="p-3 bg-slate-100 rounded-full mb-3 text-slate-300"><Check size={24} /></div>
                                            Toto vybavení nemá žádné další parametry.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 sm:p-6 border-t border-slate-100 bg-white flex items-center justify-end gap-3 sticky bottom-0 z-10">
                    <div className="w-full sm:w-auto flex gap-3">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="flex-1 sm:flex-none justify-center text-slate-500 hover:text-slate-900 border border-slate-200 hover:bg-slate-100 rounded-xl"
                        >
                            Zrušit
                        </Button>
                        {step === 'details' && (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !name.trim()}
                                className="flex-1 sm:flex-none justify-center px-6 sm:px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/30 rounded-xl font-bold flex flex-row items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
                            >
                                {isSubmitting ? <span className="animate-spin"><Loader2 size={20} /></span> : <Check size={20} strokeWidth={3} />}
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
