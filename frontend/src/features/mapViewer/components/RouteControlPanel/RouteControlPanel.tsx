import React from 'react';
import type { Route } from '../../../../types/routes';
import type { EditorType } from '../../../../types/editor';
import { Map, Calendar, Users, Briefcase, Settings, X } from 'lucide-react';
import RegenButton from './components/RegenButton/RegenButton';
import RouteNameEditor from './components/RouteNameEditor/RouteNameEditor';
import "./RouteControlPanel.css";

interface RouteControlPanelProps {
    route: Route;
    onRouteUpdate: (updatedRoute: Route) => void;
    onOpenEditor: (editorType: EditorType) => void;
    onRegenerate: () => void;
    onError: (msg: string) => void;
    isRegenerating: boolean;
    regenProgress?: number;
    isDirty: boolean;
    isMobileOpen: boolean;
    setIsMobileOpen: (isOpen: boolean) => void;
}

interface ToolButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}

const ToolButton: React.FC<ToolButtonProps> = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="route-control-panel-tool-btn">
        <div className="route-control-panel-tool-icon">{icon}</div>
        <span className="route-control-panel-tool-label">{label}</span>
    </button>
);

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
    setIsMobileOpen,
}) => {
    const [isClosing, setIsClosing] = React.useState(false);

    const handleCloseSheet = () => {
        if (isClosing) return;
        setIsClosing(true);
        setTimeout(() => {
            setIsMobileOpen(false);
            setIsClosing(false);
        }, 250);
    };

    return (
        <>
            <div className="route-control-panel-desktop-wrapper">
                <div className="route-control-panel-main-card">
                    <RouteNameEditor route={route} onRouteUpdate={onRouteUpdate} onError={onError} />
                    <ToolButton icon={<Map size={20} strokeWidth={1.5} />} label="Trasa a body" onClick={() => onOpenEditor('axis')} />
                    <ToolButton icon={<Calendar size={20} strokeWidth={1.5} />} label="Termín" onClick={() => onOpenEditor('date')} />
                    <ToolButton icon={<Users size={20} strokeWidth={1.5} />} label="Posádka" onClick={() => onOpenEditor('users')} />
                    <ToolButton icon={<Briefcase size={20} strokeWidth={1.5} />} label="Výbava" onClick={() => onOpenEditor('equipment')} />
                    <div className="route-control-panel-divider"></div>
                    <ToolButton icon={<Settings size={20} strokeWidth={1.5} />} label="Nastavení" onClick={() => onOpenEditor('config')} />
                </div>
                <div className="route-control-panel-regen-wrapper">
                    <RegenButton isRegenerating={isRegenerating} regenProgress={regenProgress} isDirty={isDirty} onRegenerate={onRegenerate} />
                </div>
            </div>

            <div className="route-control-panel-mobile-fab-wrapper">
                <button onClick={() => setIsMobileOpen(true)} className="route-control-panel-mobile-fab">
                    <Settings size={24} />
                </button>
            </div>

            {(isMobileOpen || isClosing) && (
                <div className={`route-control-panel-mobile-sheet-wrapper ${isClosing ? 'route-control-panel-mobile-sheet-closing' : ''}`}>
                    <div className="route-control-panel-mobile-backdrop" onClick={handleCloseSheet} />
                    <div className={`route-control-panel-mobile-sheet-content ${isClosing ? 'route-control-panel-mobile-sheet-closing' : ''}`}>
                        <div className="route-control-panel-mobile-close-wrapper">
                            <button onClick={handleCloseSheet} className="route-control-panel-mobile-close-btn">
                                <X size={26} />
                            </button>
                        </div>
                        <RouteNameEditor route={route} onRouteUpdate={onRouteUpdate} onError={onError} />
                        <div className="route-control-panel-mobile-grid">
                            <ToolButton icon={<Map size={20} />} label="Trasa" onClick={() => { onOpenEditor('axis'); setIsMobileOpen(false); }} />
                            <ToolButton icon={<Calendar size={20} />} label="Termín" onClick={() => { onOpenEditor('date'); setIsMobileOpen(false); }} />
                            <ToolButton icon={<Users size={20} />} label="Posádka" onClick={() => { onOpenEditor('users'); setIsMobileOpen(false); }} />
                            <ToolButton icon={<Briefcase size={20} />} label="Výbava" onClick={() => { onOpenEditor('equipment'); setIsMobileOpen(false); }} />
                        </div>
                        <ToolButton icon={<Settings size={20} />} label="Nastavení trasy" onClick={() => { onOpenEditor('config'); setIsMobileOpen(false); }} />
                        <div className="route-control-panel-mobile-regen-wrapper">
                            <RegenButton isRegenerating={isRegenerating} regenProgress={regenProgress} isDirty={isDirty} onRegenerate={onRegenerate} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default RouteControlPanel;
