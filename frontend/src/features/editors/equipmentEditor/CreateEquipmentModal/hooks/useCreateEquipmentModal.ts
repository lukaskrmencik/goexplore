import React, { useState, useEffect } from 'react';
import type { GeneralEquipment, MyEquipment } from '../../../../../types/equipment';
import {
    fetchGeneralEquipment,
    createMyEquipment,
    updateMyEquipment,
    uploadEquipmentImage,
} from '../../../../../services/equipmentApiService';
import { getImageUrl } from '../../../../../utils/imageUrl';

const EQUIPMENT_SEARCH_DEBOUNCE_MS = Number(import.meta.env.VITE_EQUIPMENT_SEARCH_DEBOUNCE ?? "300");
const EQUIPMENT_IMAGE_MAX_SIZE_MB = Number(import.meta.env.VITE_EQUIPMENT_IMAGE_MAX_SIZE_MB ?? "2");

export interface ToastState {
    message: string;
    type: 'success' | 'error';
}

interface UseCreateEquipmentModalParams {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (equipment: MyEquipment) => void;
    initialData?: MyEquipment | null;
}

function buildInitialSpecs(
    pattern: GeneralEquipment,
    existingSpecs?: Record<string, unknown>
): Record<string, unknown> {
    const specs: Record<string, unknown> = {};

    if (!pattern.specifications_keys) return specs;

    for (const [key, type] of Object.entries(pattern.specifications_keys)) {
        if (pattern.general_specifications?.[key] != null) {
            specs[key] = pattern.general_specifications[key];
        } else if (type === 'integer' || type === 'numeric') {
            specs[key] = '';
        } else if (type === 'boolean') {
            specs[key] = false;
        } else {
            specs[key] = '';
        }
    }

    if (existingSpecs) {
        for (const key of Object.keys(existingSpecs)) {
            if (key in specs) specs[key] = existingSpecs[key];
        }
    }

    return specs;
}

function castSpecsToCorrectTypes(
    specs: Record<string, unknown>,
    specsKeys: Record<string, string>
): Record<string, unknown> {
    const prepared = { ...specs };
    for (const [key, type] of Object.entries(specsKeys)) {
        if (type === 'integer') prepared[key] = parseInt(String(prepared[key])) || 0;
        else if (type === 'numeric') prepared[key] = parseFloat(String(prepared[key])) || 0;
    }
    return prepared;
}

function extractSubmitErrorMessage(err: unknown, fallback: string): string {
    if (!err || typeof err !== 'object') return fallback;
    const axiosErr = err as Record<string, any>;
    const data = axiosErr.response?.data;
    if (!data) return fallback;

    if (data.errors) {
        const firstError = Object.values(data.errors)[0];
        if (Array.isArray(firstError) && firstError[0]) return String(firstError[0]);
        if (typeof firstError === 'string') return firstError;
    }

    return data.message || data.error_message || fallback;
}

export const useCreateEquipmentModal = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
}: UseCreateEquipmentModalParams) => {
    const [step, setStep] = useState<'select' | 'details'>('select');
    const [selectedPattern, setSelectedPattern] = useState<GeneralEquipment | null>(null);
    const [generalEquipment, setGeneralEquipment] = useState<GeneralEquipment[]>([]);
    const [isLoadingPatterns, setIsLoadingPatterns] = useState(false);
    const [patternPage, setPatternPage] = useState(1);
    const [patternTotalPages, setPatternTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [name, setName] = useState('');
    const [specs, setSpecs] = useState<Record<string, unknown>>({});
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState<ToastState | null>(null);

    useEffect(() => {
        if (!isOpen) return;
        loadPatterns(1, '');
        resetForm();
        setSearchTerm('');
        setPatternPage(1);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const timer = setTimeout(() => loadPatterns(1, searchTerm), EQUIPMENT_SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [searchTerm, isOpen]);

    useEffect(() => {
        if (!isOpen || !initialData || generalEquipment.length === 0) return;
        const pattern = generalEquipment.find(g => g.id === initialData.general_equipment_id);
        if (!pattern) return;

        const rawSpecs: Record<string, unknown> = Array.isArray(initialData.specifications)
            ? {}
            : (initialData.specifications ?? {});

        setStep('details');
        setSelectedPattern(pattern);
        setName(initialData.name);
        setSpecs(buildInitialSpecs(pattern, rawSpecs));
        if (initialData.img) setPreviewUrl(getImageUrl(initialData.img));
    }, [isOpen, initialData, generalEquipment]);

    const loadPatterns = async (pageToLoad: number, searchQuery: string) => {
        setIsLoadingPatterns(true);
        try {
            const response = await fetchGeneralEquipment(pageToLoad, searchQuery);
            setGeneralEquipment(response.data || []);
            setPatternPage(response.meta?.current_page || 1);
            setPatternTotalPages(
                Math.ceil((response.meta?.total || 0) / (response.meta?.per_page || 15)) || 1
            );
        } catch {
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
        setToast(null);
    };

    const handlePatternSelect = (pattern: GeneralEquipment) => {
        setSelectedPattern(pattern);
        setStep('details');
        setSpecs(buildInitialSpecs(pattern));
    };

    const handleSpecChange = (key: string, value: string) => {
        setSpecs(prev => ({ ...prev, [key]: value }));
    };

    const handleSpecBooleanChange = (key: string, checked: boolean) => {
        setSpecs(prev => ({ ...prev, [key]: checked }));
    };

    const validateForm = (): string | null => {
        if (!name.trim()) return "Zadejte název vybavení.";
        if (!selectedPattern) return "Vyberte typ vybavení.";

        if (selectedPattern.specifications_keys) {
            for (const [key, type] of Object.entries(selectedPattern.specifications_keys)) {
                if (type === 'boolean') continue;
                const val = specs[key];
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
        if (!selectedPattern) return;

        setIsSubmitting(true);
        try {
            const preparedSpecs = selectedPattern.specifications_keys
                ? castSpecsToCorrectTypes(specs, selectedPattern.specifications_keys)
                : specs;

            let savedEquipment: MyEquipment;
            if (initialData) {
                savedEquipment = await updateMyEquipment(initialData.id, {
                    name,
                    specifications: preparedSpecs,
                });
            } else {
                savedEquipment = await createMyEquipment({
                    name,
                    general_equipment_id: selectedPattern.id,
                    specifications: preparedSpecs,
                });
            }

            if (imageFile) await uploadEquipmentImage(savedEquipment.id, imageFile);

            onSubmit(savedEquipment);
            onClose();
        } catch (err) {
            const axiosError = err as { response?: { data?: { error_message?: string } } };
            const isImageUploadFailure =
                axiosError?.response?.data?.error_message === 'The image failed to upload.';

            if (isImageUploadFailure) {
                setToast({
                    message: "Obrázek je pravděpodobně příliš velký (limit serveru). Zkuste menší soubor.",
                    type: "error",
                });
            } else {
                setToast({
                    message: extractSubmitErrorMessage(err, "Nepodařilo se uložit vybavení."),
                    type: "error",
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const maxSizeBytes = EQUIPMENT_IMAGE_MAX_SIZE_MB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            setToast({
                message: `Obrázek je příliš velký. Maximální velikost je ${EQUIPMENT_IMAGE_MAX_SIZE_MB} MB.`,
                type: "error",
            });
            e.target.value = '';
            return;
        }

        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const modalTitle = step === 'select'
        ? 'Katalog vybavení'
        : (initialData ? 'Upravit vybavení' : 'Detaily vybavení');

    return {
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
    };
};
