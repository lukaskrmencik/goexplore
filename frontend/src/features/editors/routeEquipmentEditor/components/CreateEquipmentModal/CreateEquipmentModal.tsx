import React, { useState, useMemo } from 'react';
import { X, ChevronRight, Package, Check, ArrowLeft } from 'lucide-react';
import type { GeneralEquipment } from '../../../../../types/equipment';

interface CreateEquipmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string; general_equipment_id: number; specifications: any }) => Promise<boolean>;
    generalList: GeneralEquipment[];
}

const CreateEquipmentModal: React.FC<CreateEquipmentModalProps> = ({ isOpen, onClose, onSubmit, generalList }) => {
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedTemplate, setSelectedTemplate] = useState<GeneralEquipment | null>(null);
    const [name, setName] = useState("");
    const [specs, setSpecs] = useState<Record<string, any>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [search, setSearch] = useState("");

    if (!isOpen) return null;

    const filteredTemplates = useMemo(() => {
        return generalList.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
    }, [generalList, search]);

    const handleSelectTemplate = (template: GeneralEquipment) => {
        setSelectedTemplate(template);
        setName(template.name); // Default name
        setSpecs(template.general_specifications || {}); // Pre-fill with defaults
        setStep(2);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTemplate) return;

        setIsSubmitting(true);
        const success = await onSubmit({
            name,
            general_equipment_id: selectedTemplate.id,
            specifications: specs
        });
        setIsSubmitting(false);
        if (success) {
            handleClose();
        }
    };

    const handleClose = () => {
        setStep(1);
        setSelectedTemplate(null);
        setName("");
        setSpecs({});
        setSearch("");
        onClose();
    };

    const handleSpecChange = (key: string, value: string) => {
        setSpecs(prev => ({
            ...prev,
            [key]: value
        }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="relative px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                    {step === 2 && (
                        <button
                            onClick={() => setStep(1)}
                            className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <h3 className="text-xl font-bold font-heading text-slate-900 mx-auto">
                        {step === 1 ? "Choose Template" : "Customize Gear"}
                    </h3>
                    <button
                        onClick={handleClose}
                        className="p-2 -mr-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-red-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {step === 1 ? (
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Search templates (e.g. Tent, Stove)..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                                autoFocus
                            />

                            <div className="grid grid-cols-1 gap-2">
                                {filteredTemplates.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleSelectTemplate(item)}
                                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-left group"
                                    >
                                        <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                                            {item.img ? (
                                                <img src={item.img} alt={item.name} className="h-full w-full object-cover rounded-lg" />
                                            ) : (
                                                <Package size={24} />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{item.name}</h4>
                                            <p className="text-xs text-slate-500">
                                                {Object.keys(item.specifications_keys || {}).length} properties
                                            </p>
                                        </div>
                                        <ChevronRight size={20} className="text-slate-300 group-hover:text-emerald-500" />
                                    </button>
                                ))}
                                {filteredTemplates.length === 0 && (
                                    <div className="text-center py-8 text-slate-400">
                                        No templates found.
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <form id="create-equipment-form" onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700">Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-100 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold text-slate-900"
                                    required
                                />
                            </div>

                            {selectedTemplate?.specifications_keys && (
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Specifications</h4>
                                    {Object.entries(selectedTemplate.specifications_keys).map(([key, type]) => (
                                        <div key={key} className="space-y-1">
                                            <label className="block text-sm font-medium text-slate-700 capitalize">{key.replace(/_/g, ' ')}</label>
                                            <input
                                                type={type === 'integer' || type === 'numeric' ? 'number' : 'text'}
                                                value={specs[key] || ''}
                                                onChange={(e) => handleSpecChange(key, e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 transition-all text-sm"
                                                placeholder={`Enter ${key}...`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </form>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0">
                    {step === 1 ? (
                        <div className="text-center text-xs text-slate-400">
                            Select a template to start customization
                        </div>
                    ) : (
                        <button
                            type="submit"
                            form="create-equipment-form"
                            disabled={isSubmitting || !name}
                            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <div className="h-5 w-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Check size={20} />
                                    Save & Add to Route
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateEquipmentModal;
