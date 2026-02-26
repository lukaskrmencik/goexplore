import React from 'react';
import { Check } from 'lucide-react';
import './EditorModal.css';
import type { Route } from '../../../../types/routes';
import type { EditorType } from '../../../../types/editor';
import type { EditorRefs } from '../../hooks/useEditorState';
import RouteAxisEditor from '../../../editors/routeAxisEditor/RouteAxisEditor/RouteAxisEditor';
import RouteDateEditor from '../../../editors/routeDateEditor/RouteDateEditor/RouteDateEditor';
import RouteUsersEditor from '../../../editors/routeUsersEditor/RouteUsersEditor/RouteUsersEditor';
import RouteEquipmentEditor from '../../../editors/routeEquipmentEditor/RouteEquipmentEditor/RouteEquipmentEditor';
import RouteConfigurationEditor from '../../../editors/routeConfigurationEditor/RouteConfigurationEditor/RouteConfigurationEditor';

interface EditorModalProps {
    activeEditor: EditorType;
    editorTitle: string;
    isAutoSaveEditor: boolean;
    route: Route;
    editorRefs: EditorRefs;
    onSaveAndClose: () => void;
    onRouteUpdate: (updatedRoute: Route) => void;
}

const EditorModal: React.FC<EditorModalProps> = ({
    activeEditor,
    editorTitle,
    isAutoSaveEditor,
    route,
    editorRefs,
    onSaveAndClose,
    onRouteUpdate,
}) => (
    <div className="map-viewer-editor-overlay">
        <div className="map-viewer-modal-container">
            <div className="map-viewer-modal-header">
                <div className="map-viewer-modal-header-left">
                    <h2 className="map-viewer-modal-title">{editorTitle}</h2>
                </div>
                <div className="map-viewer-modal-header-right">
                    <button
                        onClick={onSaveAndClose}
                        className={`map-viewer-modal-btn ${isAutoSaveEditor ? 'map-viewer-modal-btn-autosave' : 'map-viewer-modal-btn-save'}`}
                    >
                        {!isAutoSaveEditor && <Check size={18} />}
                        {isAutoSaveEditor ? "Zavřít" : "Uložit a zavřít"}
                    </button>
                </div>
            </div>
            <div className="map-viewer-modal-content">
                {activeEditor === 'axis' && (
                    <div className="map-viewer-editor-container">
                        <RouteAxisEditor ref={editorRefs.axisEditorRef} route={route} onUpdate={onRouteUpdate} />
                    </div>
                )}
                {activeEditor === 'date' && (
                    <div className="map-viewer-editor-container-scrollable">
                        <RouteDateEditor ref={editorRefs.dateEditorRef} route={route} onUpdate={onRouteUpdate} />
                    </div>
                )}
                {activeEditor === 'users' && (
                    <div className="map-viewer-editor-container-scrollable">
                        <RouteUsersEditor route={route} onUpdate={onRouteUpdate} />
                    </div>
                )}
                {activeEditor === 'equipment' && (
                    <div className="map-viewer-editor-container-scrollable">
                        <RouteEquipmentEditor route={route} onUpdate={onRouteUpdate} />
                    </div>
                )}
                {activeEditor === 'config' && (
                    <div className="map-viewer-editor-container-scrollable">
                        <RouteConfigurationEditor ref={editorRefs.configEditorRef} route={route} onUpdate={onRouteUpdate} />
                    </div>
                )}
            </div>
        </div>
    </div>
);

export default EditorModal;
