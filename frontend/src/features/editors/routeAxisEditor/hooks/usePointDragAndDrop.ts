import { useState } from 'react';
import type { EditorPoint } from '../../../../types/editor';

interface UsePointDragAndDropParams {
    points: EditorPoint[];
    onMoveSimpleMode: (fromIndex: number, toIndex: number) => void;
    onMoveManualMode: (fromIndex: number, toIndex: number) => void;
}

export const usePointDragAndDrop = ({ points, onMoveSimpleMode, onMoveManualMode }: UsePointDragAndDropParams) => {
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const handleDragStart = (event: React.DragEvent, id: string) => {
        setDraggedItemId(id);
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', id);
    };

    const handleDragOver = (event: React.DragEvent, targetGapIndex: number) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        setDragOverIndex(targetGapIndex);
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedItemId(null);
    };

    const resolveDropIndex = (dragId: string, targetGapIndex: number): number => {
        const dragIndex = points.findIndex(p => p.id === dragId);
        return dragIndex !== -1 && targetGapIndex > dragIndex ? targetGapIndex - 1 : targetGapIndex;
    };

    const handleSimpleModeDrop = (event: React.DragEvent, targetGapIndex: number) => {

        event.preventDefault();

        setDragOverIndex(null);
        const dragId = event.dataTransfer.getData('text/plain');

        if (!dragId) { setDraggedItemId(null); return; }

        const dragIndex = points.findIndex(p => p.id === dragId);

        const resolvedIndex = resolveDropIndex(dragId, targetGapIndex);

        if (dragIndex !== -1 && dragIndex !== resolvedIndex) {
            onMoveSimpleMode(dragIndex, resolvedIndex);
        }
        
        setDraggedItemId(null);
    };

    const handleManualModeDrop = (event: React.DragEvent, targetGapIndex: number) => {

        event.preventDefault();

        setDragOverIndex(null);

        const dragId = event.dataTransfer.getData('text/plain');

        if (!dragId) { setDraggedItemId(null); return; }

        const dragIndex = points.findIndex(p => p.id === dragId);    
        const resolvedIndex = resolveDropIndex(dragId, targetGapIndex);

        if (dragIndex !== -1 && dragIndex !== resolvedIndex) {
            onMoveManualMode(dragIndex, resolvedIndex);
        }

        setDraggedItemId(null);
    };

    return {
        draggedItemId,
        dragOverIndex,
        handleDragStart,
        handleDragOver,
        handleDragLeave,
        handleDragEnd,
        handleSimpleModeDrop,
        handleManualModeDrop,
    };
};
