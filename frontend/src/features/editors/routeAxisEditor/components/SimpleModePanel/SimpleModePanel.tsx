import { useState } from 'react';
import { GripVertical, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import type { EditorPoint } from '../../../../../types/editor';
import LocationSearch from '../LocationSearch/LocationSearch';

interface SimpleModePanelProps {
    points: EditorPoint[];
    resetCounter: number;
    setStartPoint: (lat: number, lng: number, name: string) => void;
    setEndPoint: (lat: number, lng: number, name: string) => void;
    insertSimpleWaypoint: (lat: number, lng: number, name: string, insertIndex: number) => void;
    removePoint: (id: string) => void;
    movePoint: (fromIndex: number, toIndex: number) => void;
    draggedItemId: string | null;
    dragOverIndex: number | null;
    onDragStart: (event: React.DragEvent, id: string) => void;
    onDragOver: (event: React.DragEvent, index: number) => void;
    onDragLeave: () => void;
    onDrop: (event: React.DragEvent, index: number) => void;
    onDragEnd: () => void;
    getSwapCssClass: (id: string) => string;
    triggerSwap: (movedId: string, displacedId: string, direction: 'up' | 'down') => void;
}

const SimpleModePanel: React.FC<SimpleModePanelProps> = ({
    points,
    resetCounter,
    setStartPoint,
    setEndPoint,
    insertSimpleWaypoint,
    removePoint,
    movePoint,
    draggedItemId,
    dragOverIndex,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    onDragEnd,
    getSwapCssClass,
    triggerSwap,
}) => {
    const [activeInlineInputIndex, setActiveInlineInputIndex] = useState<number | null>(null);

    const handleInsertWaypoint = (lat: number, lng: number, name: string, insertIndex: number) => {
        insertSimpleWaypoint(lat, lng, name, insertIndex);
        setActiveInlineInputIndex(null);
    };

    const waypointOnlyIndices = points
        .map((p, i) => (p.type === 'waypoint' ? i : -1))
        .filter(i => i !== -1);

    const endIndex = points.findIndex(p => p.type === 'end');
    const endPointInsertIndex = endIndex !== -1 ? endIndex : points.length;

    const renderGap = (index: number) => {
        const isDropTarget = dragOverIndex === index;
        const isInlineInputOpen = activeInlineInputIndex === index;

        if (isInlineInputOpen) {
            return (
                <div key={`gap-${index}`} className="route-axis-editor-gap-input-container">
                    <div className="route-axis-editor-waypoint-add-wrapper">
                        <LocationSearch
                            label=""
                            placeholder="Vyhledat a vložit..."
                            onSelect={(lat, lng, name) => handleInsertWaypoint(lat, lng, name, index)}
                            clearOnSelect={true}
                            isCompact={true}
                            autoFocus={true}
                            onClose={() => setActiveInlineInputIndex(null)}
                        />
                    </div>
                </div>
            );
        }

        return (
            <div
                key={`gap-${index}`}
                className={`route-axis-editor-gap ${isDropTarget ? 'route-axis-editor-gap-drag-over' : ''}`}
                onDragOver={(e) => onDragOver(e, index)}
                onDragLeave={onDragLeave}
                onDrop={(e) => onDrop(e, index)}
            >
                <button
                    className="route-axis-editor-gap-button"
                    onClick={() => setActiveInlineInputIndex(index)}
                    title="Přidat bod sem"
                >
                    <Plus size={14} strokeWidth={3} />
                </button>
            </div>
        );
    };

    return (
        <div className="route-axis-editor-simple-mode">
            <LocationSearch
                key={`${resetCounter}-start`}
                label="Start"
                placeholder="Odkud?"
                onSelect={(lat, lng, name) => setStartPoint(lat, lng, name)}
                initialValue={points.find(p => p.type === 'start')?.name}
            />

            <div className="route-axis-editor-waypoints-list">
                {points.map((waypoint, index) => {
                    if (waypoint.type !== 'waypoint') return null;

                    const positionInWaypoints = waypointOnlyIndices.indexOf(index);
                    const isFirstWaypoint = positionInWaypoints === 0;
                    const isLastWaypoint = positionInWaypoints === waypointOnlyIndices.length - 1;

                    return [
                        renderGap(index),
                        <div key={waypoint.id} className="route-axis-editor-waypoint-item-container">
                            <div
                                className={`route-axis-editor-waypoint-item ${draggedItemId === waypoint.id ? 'route-axis-editor-waypoint-item-dragging' : ''} ${getSwapCssClass(waypoint.id)}`}
                                draggable={true}
                                onDragStart={(e) => onDragStart(e, waypoint.id)}
                                onDragEnd={onDragEnd}
                            >
                                <div className="route-axis-editor-waypoint-drag-handle">
                                    <GripVertical size={16} />
                                </div>
                                <div className="route-axis-editor-mobile-reorder">
                                    <button
                                        className="route-axis-editor-mobile-reorder-btn"
                                        onClick={() => {
                                            if (!isFirstWaypoint) {
                                                const previousWaypointIndex = waypointOnlyIndices[positionInWaypoints - 1];
                                                triggerSwap(waypoint.id, points[previousWaypointIndex].id, 'up');
                                                movePoint(index, previousWaypointIndex);
                                            }
                                        }}
                                        disabled={isFirstWaypoint}
                                        title="Posunout nahoru"
                                    >
                                        <ChevronUp size={14} />
                                    </button>
                                    <button
                                        className="route-axis-editor-mobile-reorder-btn"
                                        onClick={() => {
                                            if (!isLastWaypoint) {
                                                const nextWaypointIndex = waypointOnlyIndices[positionInWaypoints + 1];
                                                triggerSwap(waypoint.id, points[nextWaypointIndex].id, 'down');
                                                movePoint(index, nextWaypointIndex);
                                            }
                                        }}
                                        disabled={isLastWaypoint}
                                        title="Posunout dolů"
                                    >
                                        <ChevronDown size={14} />
                                    </button>
                                </div>
                                <div className="route-axis-editor-waypoint-info">
                                    <span className="route-axis-editor-waypoint-name">{waypoint.name}</span>
                                </div>
                                <button onClick={() => removePoint(waypoint.id)} className="route-axis-editor-waypoint-remove">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>,
                    ];
                })}

                <div
                    className={`route-axis-editor-gap-static ${dragOverIndex === endPointInsertIndex ? 'route-axis-editor-gap-drag-over' : ''}`}
                    onDragOver={(e) => onDragOver(e, endPointInsertIndex)}
                    onDragLeave={onDragLeave}
                    onDrop={(e) => onDrop(e, endPointInsertIndex)}
                />
                <div className="route-axis-editor-waypoint-add-wrapper">
                    <LocationSearch
                        label=""
                        placeholder="Přidat další místo..."
                        onSelect={(lat, lng, name) => handleInsertWaypoint(lat, lng, name, endPointInsertIndex)}
                        clearOnSelect={true}
                        isCompact={true}
                    />
                </div>
            </div>

            <LocationSearch
                key={`${resetCounter}-end`}
                label="Cíl"
                placeholder="Kam?"
                onSelect={(lat, lng, name) => setEndPoint(lat, lng, name)}
                initialValue={points.find(p => p.type === 'end')?.name}
            />
        </div>
    );
};

export default SimpleModePanel;
