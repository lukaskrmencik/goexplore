import React, { useState } from 'react';
import type { Route } from '../../../types/routes';
import { Map, Calendar, Users, Briefcase, Settings, Edit2, RefreshCw, AlertTriangle, X } from 'lucide-react';
import { updateRoute } from '../../../services/routesApiService';

interface RouteControlPanelProps {
    route: Route;
    onRouteUpdate: (updatedRoute: Route) => void;
    onOpenEditor: (editorType: 'axis' | 'date' | 'users' | 'equipment' | 'config') => void;
    onRegenerate: () => void;
    onError: (msg: string) => void;
    isRegenerating: boolean;
    regenProgress?: number;
    isDirty: boolean;
    isMobileOpen: boolean;
    setIsMobileOpen: (isOpen: boolean) => void;
}

const RouteControlPanel: React.FC<RouteControlPanelProps> = ({
    route,
    onRouteUpdate,
    onOpenEditor,
    onRegenerate,
    onError,
    isRegenerating,
    regenProgress = 0,
    isDirty,
    isMobileOpen,
    setIsMobileOpen
}) => {
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState(route.name);
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (isEditingName && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditingName]);

    const handleSaveName = async () => {
        if (!tempName.trim()) {
            setTempName(route.name);
            setIsEditingName(false);
            return;
        }

        if (tempName !== route.name) {
            try {
                const updated = await updateRoute(route.id, { name: tempName });
                onRouteUpdate(updated);
            } catch (error: any) {
                console.error("Failed to update name", error);
                setTempName(route.name);

                // Show toast error - robust extraction
                let msg = "Nepodařilo se uložit název trasy";
                if (error?.response?.data?.error_message) {
                    msg = error.response.data.error_message;
                } else if (error?.response?.data?.message) {
                    msg = error.response.data.message;
                } else if (error?.message) {
                    msg = error.message;
                }
                onError(msg);
            }
        }
        setIsEditingName(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSaveName();
        } else if (e.key === 'Escape') {
            setTempName(route.name);
            setIsEditingName(false);
        }
    };

    const handleBlur = () => {
        handleSaveName();
    };

    const ToolButton = ({ icon, label, onClick }: any) => (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors text-left"
        >
            <div className="text-slate-400 group-hover:text-emerald-600 transition-colors">
                {icon}
            </div>
            <span className="font-bold text-sm">{label}</span>
        </button>
    );

    const RegenerateButton = () => (
        <button
            onClick={onRegenerate}
            disabled={isRegenerating}
            className={`
                w-full rounded-xl shadow-lg relative h-12 overflow-hidden transition-all
                ${!isRegenerating && isDirty ? 'shadow-amber-500/20' : 'shadow-emerald-600/20'}
                ${isRegenerating ? 'cursor-wait' : 'hover:scale-[1.02] active:scale-[0.98]'}
            `}
        >
            {/* Base Background */}
            <div className={`absolute inset-0 transition-colors duration-300 ${isRegenerating ? 'bg-emerald-100' : isDirty ? 'bg-amber-500' : 'bg-emerald-600'}`} />

            {/* Progress Bar Layer (ScaleX) */}
            {isRegenerating && (
                <div
                    className="absolute inset-0 bg-emerald-600 origin-left transition-transform duration-500 ease-linear"
                    style={{ transform: `scaleX(${regenProgress / 100})` }}
                />
            )}

            {/* Content Layer */}
            <div className={`absolute inset-0 flex items-center justify-center gap-2 z-10 ${isRegenerating && regenProgress < 50 ? 'text-emerald-900' : 'text-white'}`}>
                <RefreshCw size={18} className={isRegenerating ? "animate-spin" : ""} />
                <span className="font-bold text-sm">
                    {isRegenerating ? `Přepočítávám ${Math.round(regenProgress)}%` : "Přegenerovat trasu"}
                </span>
                {isDirty && !isRegenerating && <AlertTriangle size={16} className="animate-pulse" />}
            </div>
        </button>
    );

    const RouteNameEditor = () => (
        <div className="p-2 border-b border-slate-100 mb-1 relative group min-h-[42px] flex items-center">
            {isEditingName ? (
                <input
                    ref={inputRef}
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    className="w-full bg-transparent p-0 border-0 text-base font-bold text-slate-900 focus:ring-0 focus:outline-none placeholder-slate-400 leading-tight"
                    style={{ margin: 0 }}
                />
            ) : (
                <div
                    onClick={() => setIsEditingName(true)}
                    className="cursor-text w-full flex items-start gap-2 group/edit"
                    title="Klikni pro úpravu názvu"
                >
                    <div className="font-bold text-slate-900 line-clamp-2 leading-tight text-base break-words flex-1">
                        {route.name}
                    </div>
                    <div className="text-slate-300 group-hover/edit:text-emerald-500 transition-colors shrink-0 pt-0.5">
                        <Edit2 size={16} />
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <>
            {/* --- DESKTOP VIEW (Visible on md+) --- */}
            <div className="hidden md:flex absolute top-4 left-4 z-[1000] flex-col gap-3 w-64 pointer-events-none">
                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 pointer-events-auto flex flex-col gap-1">
                    <RouteNameEditor />
                    <ToolButton icon={<Map size={20} className="stroke-[1.5]" />} label="Trasa a body" onClick={() => onOpenEditor('axis')} />
                    <ToolButton icon={<Calendar size={20} className="stroke-[1.5]" />} label="Termín" onClick={() => onOpenEditor('date')} />
                    <ToolButton icon={<Users size={20} className="stroke-[1.5]" />} label="Posádka" onClick={() => onOpenEditor('users')} />
                    <ToolButton icon={<Briefcase size={20} className="stroke-[1.5]" />} label="Výbava" onClick={() => onOpenEditor('equipment')} />
                    <div className="h-px bg-slate-100 mx-2 my-1"></div>
                    <ToolButton icon={<Settings size={20} className="stroke-[1.5]" />} label="Nastavení" onClick={() => onOpenEditor('config')} />
                </div>
                {/* Regenerate Button */}
                <div className="pointer-events-auto">
                    <RegenerateButton />
                </div>
            </div>

            {/* --- MOBILE VIEW (Visible on small screens) --- */}

            {/* 1. FAB (Floating Action Button) - Bottom Right */}
            <div className="md:hidden absolute bottom-6 right-4 z-[1000] pointer-events-auto flex flex-col items-end gap-3">
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="w-14 h-14 rounded-full bg-emerald-600 text-white shadow-xl shadow-emerald-900/20 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                >
                    <Settings size={24} />
                </button>
            </div>

            {/* 2. Bottom Sheet Overlay */}
            {isMobileOpen && (
                <div className="md:hidden fixed top-14 bottom-[60px] left-0 right-0 z-[3000] flex flex-col justify-end pb-0 px-0">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setIsMobileOpen(false)}
                    />

                    {/* Sheet Content */}
                    <div className="relative bg-white w-full rounded-t-3xl shadow-2xl p-4 animate-in slide-in-from-bottom duration-300 ease-out flex flex-col gap-3 border-t border-slate-100 max-h-[85vh] overflow-y-auto">

                        {/* Minimalist Header */}
                        <div className="flex items-center justify-end pb-2">
                            <button
                                onClick={() => setIsMobileOpen(false)}
                                className="p-2 -mr-2 -mt-2 text-slate-400 hover:text-slate-900 bg-transparent hover:bg-slate-50 rounded-full transition-colors"
                            >
                                <X size={26} />
                            </button>
                        </div>

                        <RouteNameEditor />

                        <div className="grid grid-cols-2 gap-2">
                            <ToolButton icon={<Map size={20} />} label="Trasa" onClick={() => { onOpenEditor('axis'); setIsMobileOpen(false); }} />
                            <ToolButton icon={<Calendar size={20} />} label="Termín" onClick={() => { onOpenEditor('date'); setIsMobileOpen(false); }} />
                            <ToolButton icon={<Users size={20} />} label="Posádka" onClick={() => { onOpenEditor('users'); setIsMobileOpen(false); }} />
                            <ToolButton icon={<Briefcase size={20} />} label="Výbava" onClick={() => { onOpenEditor('equipment'); setIsMobileOpen(false); }} />
                        </div>

                        <ToolButton icon={<Settings size={20} />} label="Nastavení trasy" onClick={() => { onOpenEditor('config'); setIsMobileOpen(false); }} />

                        <div className="pt-2">
                            <RegenerateButton />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
export default RouteControlPanel;
