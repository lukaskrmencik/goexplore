import { GripVertical, MapPin, Play, Flag, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import type { EditorPoint } from '../../../../../types/editor';

interface ManualModePanelProps {
    points: EditorPoint[];
    draggedItemId: string | null;
    dragOverIndex: number | null;
    onDragStart: (event: React.DragEvent, id: string) => void;
    onDragOver: (event: React.DragEvent, index: number) => void;
    onDragLeave: () => void;
    onDrop: (event: React.DragEvent, index: number) => void;
    onDragEnd: () => void;
    moveManualPoint: (fromIndex: number, toIndex: number) => void;
    removeManualPoint: (id: string) => void;
    getSwapCssClass: (id: string) => string;
    triggerSwap: (movedId: string, displacedId: string, direction: 'up' | 'down') => void;
}

const pointTypeIcons: Record<'start' | 'end' | 'waypoint', React.ReactNode> = {
    start: <Play size={14} className="route-axis-editor-manual-point-icon-start" />,
    end: <Flag size={14} className="route-axis-editor-manual-point-icon-end" />,
    waypoint: <MapPin size={14} className="route-axis-editor-manual-point-icon-waypoint" />,
};

const pointTypeLabels: Record<'start' | 'end' | 'waypoint', string> = {
    start: 'Start',
    end: 'Cíl',
    waypoint: 'Bod',
};

const ManualModePanel: React.FC<ManualModePanelProps> = ({
    points,
    draggedItemId,
    dragOverIndex,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    onDragEnd,
    moveManualPoint,
    removeManualPoint,
    getSwapCssClass,
    triggerSwap,
}) => {
    return (
        <div className="route-axis-editor-manual-mode">
            <p className="route-axis-editor-manual-instruction">
                Klikáním do mapy přidávej body. Klikni na čáru pro vložení bodu. Body můžeš přetahovat.
            </p>

            {points.length === 0 ? (
                <div className="route-axis-editor-manual-empty">
                    <MapPin size={24} className="route-axis-editor-manual-empty-icon" />
                    <p>Klikni na mapu pro přidání prvního bodu</p>
                </div>
            ) : (
                <div className="route-axis-editor-manual-points-list">
                    {points.map((point, index) => (
                        <div key={point.id}>
                            {index > 0 && (
                                <div
                                    className={`route-axis-editor-manual-drop-zone ${dragOverIndex === index ? 'route-axis-editor-manual-drop-zone-active' : ''}`}
                                    onDragOver={(e) => onDragOver(e, index)}
                                    onDragLeave={onDragLeave}
                                    onDrop={(e) => onDrop(e, index)}
                                />
                            )}
                            <div
                                className={`route-axis-editor-manual-point-item ${draggedItemId === point.id ? 'route-axis-editor-manual-point-item-dragging' : ''} ${getSwapCssClass(point.id)}`}
                                draggable={true}
                                onDragStart={(e) => onDragStart(e, point.id)}
                                onDragEnd={onDragEnd}
                            >
                                <div className="route-axis-editor-manual-point-drag">
                                    <GripVertical size={14} />
                                </div>
                                <div className="route-axis-editor-mobile-reorder">
                                    <button
                                        className="route-axis-editor-mobile-reorder-btn"
                                        onClick={() => {
                                            if (index > 0) {
                                                triggerSwap(point.id, points[index - 1].id, 'up');
                                                moveManualPoint(index, index - 1);
                                            }
                                        }}
                                        disabled={index === 0}
                                        title="Posunout nahoru"
                                    >
                                        <ChevronUp size={14} />
                                    </button>
                                    <button
                                        className="route-axis-editor-mobile-reorder-btn"
                                        onClick={() => {
                                            if (index < points.length - 1) {
                                                triggerSwap(point.id, points[index + 1].id, 'down');
                                                moveManualPoint(index, index + 1);
                                            }
                                        }}
                                        disabled={index === points.length - 1}
                                        title="Posunout dolů"
                                    >
                                        <ChevronDown size={14} />
                                    </button>
                                </div>
                                <div className={`route-axis-editor-manual-point-type-badge route-axis-editor-manual-point-type-${point.type}`}>
                                    {pointTypeIcons[point.type]}
                                </div>
                                <div className="route-axis-editor-manual-point-info">
                                    <span className="route-axis-editor-manual-point-label">{pointTypeLabels[point.type]}</span>
                                    <span className="route-axis-editor-manual-point-coords">
                                        {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                                    </span>
                                </div>
                                {points.length > 1 && (
                                    <button
                                        onClick={() => removeManualPoint(point.id)}
                                        className="route-axis-editor-manual-point-remove"
                                        title="Odebrat bod"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManualModePanel;
