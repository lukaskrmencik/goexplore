import { useEffect, useRef, useCallback } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { Play, Flag, MapPin, Trash2 } from "lucide-react";
import type { EditorPoint } from "../../../../../types/editor";

interface EditorMarkersProps {
    points: EditorPoint[];
    draggable?: boolean;
    onMarkerDragEnd?: (id: string, lat: number, lng: number) => void;
    onRemovePoint?: (id: string) => void;
    mode?: 'simple' | 'manual';
}

const EditorMarkers: React.FC<EditorMarkersProps> = ({
    points,
    draggable = false,
    onMarkerDragEnd,
    onRemovePoint,
    mode,
}) => {
    const map = useMap();
    const markersRef = useRef<L.Marker[]>([]);
    const onRemovePointRef = useRef(onRemovePoint);
    const onMarkerDragEndRef = useRef(onMarkerDragEnd);
    const activeDeleteIdRef = useRef<string | null>(null);

    useEffect(() => {
        onRemovePointRef.current = onRemovePoint;
    }, [onRemovePoint]);

    useEffect(() => {
        onMarkerDragEndRef.current = onMarkerDragEnd;
    }, [onMarkerDragEnd]);

    const clearActiveDelete = useCallback(() => {
        if (activeDeleteIdRef.current) {
            const prev = document.querySelector('.editor-marker-delete-visible');
            if (prev) prev.classList.remove('editor-marker-delete-visible');
            activeDeleteIdRef.current = null;
        }
    }, []);

    useEffect(() => {
        map.on('click', clearActiveDelete);
        return () => { map.off('click', clearActiveDelete); };
    }, [map, clearActiveDelete]);

    useEffect(() => {
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        const showDeleteButton = mode === 'manual' && !!onRemovePoint && points.length > 1;

        points.forEach((point) => {
            let Icon = MapPin;
            let bgColor = '#f59e0b';
            let size = 32;
            let iconSize = 18;

            if (point.type === 'start') {
                Icon = Play;
                bgColor = '#10b981';
                size = 36;
                iconSize = 20;
            } else if (point.type === 'end') {
                Icon = Flag;
                bgColor = '#ef4444';
                size = 36;
                iconSize = 20;
            }

            const iconSvg = renderToStaticMarkup(<Icon size={iconSize} strokeWidth={2.5} />);
            const trashSvg = renderToStaticMarkup(<Trash2 size={12} />);

            const deleteBtnHtml = showDeleteButton
                ? `<button class="editor-marker-delete-btn" data-point-id="${point.id}" title="Smazat bod">${trashSvg}</button>`
                : '';

            const html = `
                <div class="editor-marker-container" data-marker-id="${point.id}">
                    <div class="custom-marker-base" style="width:${size}px;height:${size}px;background-color:${bgColor};color:#ffffff;">
                        ${iconSvg}
                        <div class="custom-marker-pointer" style="background-color:${bgColor};"></div>
                    </div>
                    ${deleteBtnHtml}
                </div>
            `;

            const icon = L.divIcon({
                html,
                className: 'editor-marker-wrapper',
                iconSize: [size + 28, size],
                iconAnchor: [size / 2, size + 4],
            });

            const marker = L.marker([point.lat, point.lng], { icon, draggable });

            if (draggable) {
                marker.on('dragend', () => {
                    const pos = marker.getLatLng();
                    onMarkerDragEndRef.current?.(point.id, pos.lat, pos.lng);
                });
            }

            marker.addTo(map);

            if (showDeleteButton) {
                const el = marker.getElement();
                if (el) {
                    const container = el.querySelector('.editor-marker-container') as HTMLElement;
                    const btn = el.querySelector('.editor-marker-delete-btn') as HTMLElement;

                    if (btn) {
                        btn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            activeDeleteIdRef.current = null;
                            onRemovePointRef.current?.(point.id);
                        });
                        btn.addEventListener('mousedown', (e) => {
                            e.stopPropagation();
                        });
                        btn.addEventListener('touchstart', (e) => {
                            e.stopPropagation();
                        }, { passive: true });
                    }

                    if (container) {
                        container.addEventListener('click', (e) => {
                            e.stopPropagation();

                            const prev = document.querySelector('.editor-marker-delete-visible');
                            if (prev && prev !== container) {
                                prev.classList.remove('editor-marker-delete-visible');
                            }

                            if (activeDeleteIdRef.current === point.id) {
                                container.classList.remove('editor-marker-delete-visible');
                                activeDeleteIdRef.current = null;
                            } else {
                                container.classList.add('editor-marker-delete-visible');
                                activeDeleteIdRef.current = point.id;
                            }
                        });
                    }
                }
            }

            markersRef.current.push(marker);
        });

        return () => {
            markersRef.current.forEach(m => m.remove());
            markersRef.current = [];
        };
    }, [points, draggable, mode, map, onRemovePoint]);

    return null;
};

export default EditorMarkers;
