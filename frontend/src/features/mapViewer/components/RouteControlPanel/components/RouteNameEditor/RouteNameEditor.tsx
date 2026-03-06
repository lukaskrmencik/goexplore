import React, { useState, useRef, useEffect } from 'react';
import { Edit2 } from 'lucide-react';
import './RouteNameEditor.css';
import type { Route } from '../../../../../../types/routes';
import { updateRoute } from '../../../../../../services/routesApiService';
import { getErrorMessage } from '../../../../../../utils/apiError';

interface RouteNameEditorProps {
    route: Route;
    onRouteUpdate: (updatedRoute: Route) => void;
    onError: (message: string) => void;
}

const RouteNameEditor: React.FC<RouteNameEditorProps> = ({ route, onRouteUpdate, onError }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState(route.name);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);


    useEffect(() => {
        if (!isEditing) setTempName(route.name);
    }, [route.name, route.id, isEditing]);


    const handleSave = async () => {
        if (!tempName.trim()) {
            setTempName(route.name);
            setIsEditing(false);
            return;
        }
        if (tempName !== route.name) {
            try {
                const updated = await updateRoute(route.id, { name: tempName });
                onRouteUpdate({ ...route, name: updated.name });
            } catch (error: unknown) {
                setTempName(route.name);
                onError(getErrorMessage(error, "Nepodařilo se uložit název trasy"));
            }
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSave();
        else if (e.key === 'Escape') {
            setTempName(route.name);
            setIsEditing(false);
        }
    };

    {/* --- START: AI-GENERATED UI (Claude 3.7 Sonnet Thinking) --- */}
    {/* Layout and structure generated from design. Data binding and variables added manually. */}

    return (
        <div className="route-control-panel-name-editor">
            {isEditing ? (
                <input
                    ref={inputRef}
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSave}
                    className="route-control-panel-name-input"
                />
            ) : (
                <div
                    onClick={() => setIsEditing(true)}
                    className="route-control-panel-name-display"
                    title="Klikni pro úpravu názvu"
                >
                    <div className="route-control-panel-name-text">{route.name}</div>
                    <div className="route-control-panel-name-edit-icon">
                        <Edit2 size={16} />
                    </div>
                </div>
            )}
        </div>
    );

    {/* --- END: AI-GENERATED UI --- */}
};

export default RouteNameEditor;
