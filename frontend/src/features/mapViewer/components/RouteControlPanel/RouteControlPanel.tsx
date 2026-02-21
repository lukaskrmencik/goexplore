import React, { useState } from 'react';
import type { Route } from '../../../../types/routes';
import { Map, Calendar, Users, Briefcase, Settings, Edit2, RefreshCw, AlertTriangle, X } from 'lucide-react';
import { updateRoute } from '../../../../services/routesApiService';
import "./RouteControlPanel.css";

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
            className="route-control-panel-tool-btn"
        >
            <div className="route-control-panel-tool-icon">
                {icon}
            </div>
            <span className="route-control-panel-tool-label">{label}</span>
        </button>
    );

    const RegenerateButton = () => (
        <button
            onClick={onRegenerate}
            disabled={isRegenerating}
            className={`route-control-panel-regen-btn ${!isRegenerating && isDirty ? 'route-control-panel-regen-dirty' : 'route-control-panel-regen-clean'}`}
        >
            {/* Base Background */}
            <div className={`route-control-panel-regen-bg ${isRegenerating ? 'route-control-panel-regen-bg-running' : isDirty ? 'route-control-panel-regen-bg-dirty' : 'route-control-panel-regen-bg-clean'}`} />

            {/* Progress Bar Layer (ScaleX) */}
            {isRegenerating && (
                <div
                    className="route-control-panel-regen-progress"
                    style={{ transform: `scaleX(${regenProgress / 100})` }}
                />
            )}

            {/* Content Layer */}
            <div className={`route-control-panel-regen-content ${isRegenerating && regenProgress < 50 ? 'route-control-panel-regen-text-dark' : 'route-control-panel-regen-text-light'}`}>
                <RefreshCw size={18} className={isRegenerating ? "animate-spin" : ""} />
                <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>
                    {isRegenerating ? `Přepočítávám ${Math.round(regenProgress)}%` : "Přegenerovat trasu"}
                </span>
                {isDirty && !isRegenerating && <AlertTriangle size={16} className="animate-pulse" />}
            </div>
        </button>
    );

    const RouteNameEditor = () => (
        <div className="route-control-panel-name-editor">
            {isEditingName ? (
                <input
                    ref={inputRef}
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    className="route-control-panel-name-input"
                />
            ) : (
                <div
                    onClick={() => setIsEditingName(true)}
                    className="route-control-panel-name-display"
                    title="Klikni pro úpravu názvu"
                >
                    <div className="route-control-panel-name-text">
                        {route.name}
                    </div>
                    <div className="route-control-panel-name-edit-icon">
                        <Edit2 size={16} />
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <>
            {/* --- DESKTOP VIEW (Visible on md+) --- */}
            <div className="route-control-panel-desktop-wrapper">
                {/* Main Card */}
                <div className="route-control-panel-main-card">
                    <RouteNameEditor />
                    <ToolButton icon={<Map size={20} strokeWidth={1.5} />} label="Trasa a body" onClick={() => onOpenEditor('axis')} />
                    <ToolButton icon={<Calendar size={20} strokeWidth={1.5} />} label="Termín" onClick={() => onOpenEditor('date')} />
                    <ToolButton icon={<Users size={20} strokeWidth={1.5} />} label="Posádka" onClick={() => onOpenEditor('users')} />
                    <ToolButton icon={<Briefcase size={20} strokeWidth={1.5} />} label="Výbava" onClick={() => onOpenEditor('equipment')} />
                    <div className="route-control-panel-divider"></div>
                    <ToolButton icon={<Settings size={20} strokeWidth={1.5} />} label="Nastavení" onClick={() => onOpenEditor('config')} />
                </div>
                {/* Regenerate Button */}
                <div className="route-control-panel-regen-wrapper">
                    <RegenerateButton />
                </div>
            </div>

            {/* --- MOBILE VIEW (Visible on small screens) --- */}

            {/* 1. FAB (Floating Action Button) - Bottom Right */}
            <div className="route-control-panel-mobile-fab-wrapper">
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="route-control-panel-mobile-fab"
                >
                    <Settings size={24} />
                </button>
            </div>

            {/* 2. Bottom Sheet Overlay */}
            {isMobileOpen && (
                <div className="route-control-panel-mobile-sheet-wrapper">
                    {/* Backdrop */}
                    <div
                        className="route-control-panel-mobile-backdrop"
                        onClick={() => setIsMobileOpen(false)}
                    />

                    {/* Sheet Content */}
                    <div className="route-control-panel-mobile-sheet-content">

                        {/* Minimalist Header */}
                        <div className="route-control-panel-mobile-close-wrapper">
                            <button
                                onClick={() => setIsMobileOpen(false)}
                                className="route-control-panel-mobile-close-btn"
                            >
                                <X size={26} />
                            </button>
                        </div>

                        <RouteNameEditor />

                        <div className="route-control-panel-mobile-grid">
                            <ToolButton icon={<Map size={20} />} label="Trasa" onClick={() => { onOpenEditor('axis'); setIsMobileOpen(false); }} />
                            <ToolButton icon={<Calendar size={20} />} label="Termín" onClick={() => { onOpenEditor('date'); setIsMobileOpen(false); }} />
                            <ToolButton icon={<Users size={20} />} label="Posádka" onClick={() => { onOpenEditor('users'); setIsMobileOpen(false); }} />
                            <ToolButton icon={<Briefcase size={20} />} label="Výbava" onClick={() => { onOpenEditor('equipment'); setIsMobileOpen(false); }} />
                        </div>

                        <ToolButton icon={<Settings size={20} />} label="Nastavení trasy" onClick={() => { onOpenEditor('config'); setIsMobileOpen(false); }} />

                        <div className="route-control-panel-mobile-regen-wrapper">
                            <RegenerateButton />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
export default RouteControlPanel;
