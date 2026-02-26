import { forwardRef, useImperativeHandle, useState, useEffect, useRef, useCallback } from "react";
import { type LatLngExpression } from "leaflet";
import { Trash2 } from "lucide-react";
import { useRouteAxis } from "../hooks/useRouteAxis";
import { useSwapAnimation } from "../hooks/useSwapAnimation";
import { usePointDragAndDrop } from "../hooks/usePointDragAndDrop";
import type { RouteAxisEditorHandle, RouteEditorProps } from "../../../../types/editor";
import LeafletMap from "../../../../components/LeafletMap/LeafletMap";
import EditorMarkers from "../components/EditorMarkers/EditorMarkers";
import RoutePolyline from "../components/RoutePolyline/RoutePolyline";
import MapClickHandler from "../components/MapClickHandler/MapClickHandler";
import CzechBoundaryOverlay from "../components/CzechBoundaryOverlay/CzechBoundaryOverlay";
import RouteLengthBanner from "../components/RouteLengthBanner/RouteLengthBanner";
import SimpleModePanel from "../components/SimpleModePanel/SimpleModePanel";
import ManualModePanel from "../components/ManualModePanel/ManualModePanel";
import { getRouteLengthConstraints } from '../../../../utils/routeLengthEstimator';
import { preloadCzechBoundary } from '../../../../utils/czechBoundary';
import './RouteAxisEditor.css';

const RouteAxisEditor = forwardRef<RouteAxisEditorHandle, RouteEditorProps>(({ route, onUpdate, onChange }, ref) => {
    const {
        points,
        estimatedRoadKm,
        insertSimpleWaypoint,
        setStartPoint,
        setEndPoint,
        removePoint,
        movePoint,
        saveChanges,
        handleReset,
        handleMapClick,
        insertPointOnSegment,
        updatePointPosition,
        removeManualPoint,
        moveManualPoint,
    } = useRouteAxis(route, onUpdate);

    const { minKmPerDay, minDays } = getRouteLengthConstraints();
    const minimumRequiredKm = minKmPerDay * minDays;

    const { triggerSwap, getSwapCssClass } = useSwapAnimation();
    const dragAndDrop = usePointDragAndDrop({
        points,
        onMoveSimpleMode: movePoint,
        onMoveManualMode: moveManualPoint,
    });

    const [isMobileExpanded, setIsMobileExpanded] = useState(false);
    const [resetCounter, setResetCounter] = useState(0);
    const segmentClickInProgressRef = useRef(false);

    useEffect(() => {
        onChange?.();
    }, [points, onChange]);

    useEffect(() => {
        preloadCzechBoundary();
    }, []);

    useImperativeHandle(ref, () => ({
        save: async () => {
            if (estimatedRoadKm < minimumRequiredKm && estimatedRoadKm > 0) {
                throw new Error(
                    `Trasa je příliš krátká. Odhadovaná délka je ${Math.round(estimatedRoadKm)} km, ale minimum je ${Math.round(minimumRequiredKm)} km (${minDays} dny × ${minKmPerDay} km/den).`
                );
            }
            await saveChanges();
        },
        getEstimatedRoadKm: () => estimatedRoadKm,
    }), [estimatedRoadKm, minimumRequiredKm, minDays, minKmPerDay, saveChanges]);

    const handleSegmentClick = useCallback((segmentIndex: number, lat: number, lng: number) => {
        segmentClickInProgressRef.current = true;
        insertPointOnSegment(segmentIndex, lat, lng);
        setTimeout(() => { segmentClickInProgressRef.current = false; }, 50);
    }, [insertPointOnSegment]);

    const handleMapClickGuarded = useCallback((lat: number, lng: number) => {
        if (segmentClickInProgressRef.current) return;
        handleMapClick(lat, lng);
    }, [handleMapClick]);

    const handleResetAll = () => {
        handleReset();
        setResetCounter(count => count + 1);
    };

    const isManualMode = route.mode === 'manual';
    const polylineCoords: LatLngExpression[] = points.map(p => [p.lat, p.lng]);

    return (
        <div className="route-axis-editor-container">
            <div className={`route-axis-editor-sidebar ${isMobileExpanded ? 'route-axis-editor-sidebar-expanded' : 'route-axis-editor-sidebar-collapsed'}`}>
                <div className="route-axis-editor-sidebar-inner">
                    <div
                        className="route-axis-editor-mobile-handle"
                        onClick={() => setIsMobileExpanded(!isMobileExpanded)}
                    >
                        <div className="route-axis-editor-mobile-handle-bar" />
                        <span className="route-axis-editor-mobile-handle-text">
                            {isMobileExpanded ? 'Zavřít panel' : 'Upravit trasu'}
                        </span>
                    </div>

                    <div className="route-axis-editor-header">
                        <div className="route-axis-editor-header-left" onClick={() => setIsMobileExpanded(true)}>
                            <div className="route-axis-editor-header-text-container">
                                <h3 className="route-axis-editor-header-title">Plánovač trasy</h3>
                                <p className="route-axis-editor-header-subtitle-desktop">
                                    {isManualMode ? 'Kreslení na mapě' : 'na mapě'}
                                </p>
                                <p className="route-axis-editor-header-subtitle-mobile">
                                    {points.length} bodů • {isMobileExpanded ? 'Klepnutím sbalit' : 'Klepnutím upravit'}
                                </p>
                            </div>
                        </div>
                        <button onClick={handleResetAll} className="route-axis-editor-reset-btn">
                            <span className="route-axis-editor-reset-text">Reset</span>
                            <Trash2 size={16} className="route-axis-editor-reset-icon" />
                        </button>
                    </div>

                    <div className="route-axis-editor-content custom-scrollbar">
                        {isManualMode ? (
                            <ManualModePanel
                                points={points}
                                draggedItemId={dragAndDrop.draggedItemId}
                                dragOverIndex={dragAndDrop.dragOverIndex}
                                onDragStart={dragAndDrop.handleDragStart}
                                onDragOver={dragAndDrop.handleDragOver}
                                onDragLeave={dragAndDrop.handleDragLeave}
                                onDrop={dragAndDrop.handleManualModeDrop}
                                onDragEnd={dragAndDrop.handleDragEnd}
                                moveManualPoint={moveManualPoint}
                                removeManualPoint={removeManualPoint}
                                getSwapCssClass={getSwapCssClass}
                                triggerSwap={triggerSwap}
                            />
                        ) : (
                            <SimpleModePanel
                                points={points}
                                resetCounter={resetCounter}
                                setStartPoint={setStartPoint}
                                setEndPoint={setEndPoint}
                                insertSimpleWaypoint={insertSimpleWaypoint}
                                removePoint={removePoint}
                                movePoint={movePoint}
                                draggedItemId={dragAndDrop.draggedItemId}
                                dragOverIndex={dragAndDrop.dragOverIndex}
                                onDragStart={dragAndDrop.handleDragStart}
                                onDragOver={dragAndDrop.handleDragOver}
                                onDragLeave={dragAndDrop.handleDragLeave}
                                onDrop={dragAndDrop.handleSimpleModeDrop}
                                onDragEnd={dragAndDrop.handleDragEnd}
                                getSwapCssClass={getSwapCssClass}
                                triggerSwap={triggerSwap}
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className={`route-axis-editor-map-area ${isManualMode ? 'route-axis-editor-map-area-crosshair' : ''}`}>
                <RouteLengthBanner
                    estimatedKm={estimatedRoadKm}
                    minimumRequiredKm={minimumRequiredKm}
                />
                <LeafletMap>
                    <CzechBoundaryOverlay />
                    <MapClickHandler
                        onMapClick={handleMapClickGuarded}
                        isActive={isManualMode}
                    />
                    <EditorMarkers
                        points={points}
                        draggable={isManualMode}
                        onMarkerDragEnd={isManualMode ? updatePointPosition : undefined}
                        onRemovePoint={isManualMode ? removeManualPoint : undefined}
                        mode={route.mode}
                    />
                    {polylineCoords.length > 1 && (
                        <RoutePolyline
                            coordinates={polylineCoords}
                            onSegmentClick={isManualMode ? handleSegmentClick : undefined}
                        />
                    )}
                </LeafletMap>
            </div>
        </div>
    );
});

export default RouteAxisEditor;
