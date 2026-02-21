import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { type LatLngExpression } from "leaflet";
import { useRouteAxis } from ".././hooks/useRouteAxis";
import type { RouteAxisEditorHandle, RouteEditorProps } from "../../../../types/editor";
import LeafletMap from "../../../leafletMap/components/LeafletMap/LeafletMap";
import LocationSearch from ".././components/LocationSearch/LocationSearch";
import EditorMarkers from ".././components/EditorMarkers/EditorMarkers";
import RoutePolyline from ".././components/RoutePolyline/RoutePolyline";
import MapClickHandler from ".././components/MapClickHandler/MapClickHandler";
import { Navigation, Trash2, Check } from "lucide-react";
import './RouteAxisEditor.css';

const RouteAxisEditor = forwardRef<RouteAxisEditorHandle, RouteEditorProps>(({ route, onUpdate, onChange }, ref) => {
    const {
        points,
        customModeFinished,
        addSimpleWaypoint,
        setStartPoint,
        setEndPoint,
        removePoint,
        saveChanges,
        handleReset,
        handleCustomFinish,
        handleMapClick
    } = useRouteAxis(route, onUpdate);

    useEffect(() => {
        onChange?.();
    }, [points, customModeFinished, onChange]);

    // Mobile Bottom Sheet State
    const [isMobileExpanded, setIsMobileExpanded] = useState(false);

    useImperativeHandle(ref, () => ({
        save: async () => {
            await saveChanges();
        }
    }));

    const polylineCoords: LatLngExpression[] = points.map(p => [p.lat, p.lng]);

    // MAP-FIRST LAYOUT: Desktop = Sidebar (Left) + Map (Right). Mobile = Map (Full) + Floating Panel (Top).
    return (
        <div className="route-axis-editor-container">

            {/* 1. SIDEBAR PANELS */}
            <div className={`route-axis-editor-sidebar ${isMobileExpanded ? 'route-axis-editor-sidebar-expanded' : 'route-axis-editor-sidebar-collapsed'}`}>
                {/* Inner Content Container */}
                <div className="route-axis-editor-sidebar-inner">
                    {/* Mobile Handle / Toggle with Label */}
                    <div
                        className="route-axis-editor-mobile-handle"
                        onClick={() => setIsMobileExpanded(!isMobileExpanded)}
                    >
                        <div className="route-axis-editor-mobile-handle-bar" />
                        <span className="route-axis-editor-mobile-handle-text">
                            {isMobileExpanded ? 'Zavřít panel' : 'Upravit trasu'}
                        </span>
                    </div>

                    {/* Header specific to mode */}
                    <div className="route-axis-editor-header">
                        <div className="route-axis-editor-header-left" onClick={() => setIsMobileExpanded(true)}>
                            <div className="route-axis-editor-header-icon-wrapper">
                                <Navigation size={18} />
                            </div>
                            <div className="route-axis-editor-header-text-container">
                                <h3 className="route-axis-editor-header-title">
                                    {route.mode === 'simple' ? 'Plánovač' : 'Kreslení'}
                                </h3>
                                <p className="route-axis-editor-header-subtitle-desktop">
                                    {route.mode === 'simple' ? 'Trasa' : 'Ručně'}
                                </p>
                                <p className="route-axis-editor-header-subtitle-mobile">
                                    {points.length} bodů • {isMobileExpanded ? 'Klepnutím sbalit' : 'Klepnutím upravit'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleReset}
                            className="route-axis-editor-reset-btn group"
                        >
                            <span className="route-axis-editor-reset-text">Reset</span>
                            <Trash2 size={16} className="route-axis-editor-reset-icon" />
                        </button>
                    </div>

                    {/* Content Scroll Area */}
                    <div className="route-axis-editor-content custom-scrollbar">
                        {route.mode === 'simple' ? (
                            <>
                                <div className="route-axis-editor-simple-mode">
                                    <LocationSearch
                                        label="Start"
                                        placeholder="Odkud?"
                                        onSelect={(lat, lng, name) => setStartPoint(lat, lng, name)}
                                        initialValue={points.find(p => p.type === 'start')?.name}
                                    />

                                    {/* Waypoints List */}
                                    <div className="route-axis-editor-waypoints-list">
                                        {points.filter(p => p.type === 'waypoint').map((wp, index) => (
                                            <div key={wp.id} className="route-axis-editor-waypoint-item">
                                                <div className="route-axis-editor-waypoint-info">
                                                    <span className="route-axis-editor-waypoint-number">
                                                        {index + 1}
                                                    </span>
                                                    <span className="route-axis-editor-waypoint-name">{wp.name}</span>
                                                </div>
                                                <button onClick={() => removePoint(wp.id)} className="route-axis-editor-waypoint-remove">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}

                                        {/* Add Waypoint Trigger */}
                                        <div className="route-axis-editor-waypoint-add-wrapper">
                                            <LocationSearch
                                                label="Zastávka"
                                                placeholder="+ Přidat místo"
                                                onSelect={(lat, lng, name) => addSimpleWaypoint(lat, lng, name)}
                                                clearOnSelect={true}
                                                isCompact={true}
                                            />
                                        </div>
                                    </div>

                                    <LocationSearch
                                        label="Cíl"
                                        placeholder="Kam?"
                                        onSelect={(lat, lng, name) => setEndPoint(lat, lng, name)}
                                        initialValue={points.find(p => p.type === 'end')?.name}
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="route-axis-editor-manual-instruction">
                                    Klikáním do mapy vytvořte trasu.
                                </p>

                                <div className="route-axis-editor-manual-points-count">
                                    <div className="route-axis-editor-manual-points-label">
                                        <span className="route-axis-editor-manual-points-label-title">Body</span>
                                        <span className="route-axis-editor-manual-points-label-subtitle">Počet</span>
                                    </div>
                                    <span className="route-axis-editor-manual-points-value">{points.length}</span>
                                </div>

                                {!customModeFinished ? (
                                    <button
                                        onClick={handleCustomFinish}
                                        disabled={points.length < 2}
                                        className="route-axis-editor-manual-finish-btn"
                                    >
                                        <span>Dokončit</span>
                                        <Check size={18} />
                                    </button>
                                ) : (
                                    <div className="route-axis-editor-manual-done">
                                        <div className="route-axis-editor-manual-done-icon">
                                            <Check size={20} />
                                        </div>
                                        <p className="route-axis-editor-manual-done-text">Hotovo!</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. THE MAP */}
            <div className={`route-axis-editor-map-area ${route.mode === 'manual' && !customModeFinished ? 'route-axis-editor-map-area-crosshair' : ''}`}>
                <LeafletMap>
                    <MapClickHandler
                        onMapClick={handleMapClick}
                        isActive={route.mode === 'manual' && !customModeFinished}
                    />
                    <EditorMarkers points={points} />
                    {polylineCoords.length > 1 && <RoutePolyline coordinates={polylineCoords} />}
                </LeafletMap>
            </div>

        </div>
    );
});

export default RouteAxisEditor;