import { forwardRef, useImperativeHandle, useEffect } from "react";
import { useRouteConfiguration } from ".././hooks/useRouteConfiguration";
import type { RouteConfigurationEditorHandle, RouteEditorProps } from "../../../../types/editor";
import { Settings, Maximize, Navigation, Map } from "lucide-react";
import "./RouteConfigurationEditor.css";

const RouteConfigurationEditor = forwardRef<RouteConfigurationEditorHandle, RouteEditorProps>(({ route, onUpdate, onChange }, ref) => {
    const {
        bufferSize,
        setBufferSize,
        maxRouteLength,
        setMaxRouteLength,
        poiPerDay,
        setPoiPerDay,
        handleSave
    } = useRouteConfiguration(route, onUpdate);

    useEffect(() => {
        onChange?.();
    }, [bufferSize, maxRouteLength, poiPerDay, onChange]);

    useImperativeHandle(ref, () => ({
        save: async () => {
            await handleSave();
        }
    }));

    return (
        <div className="route-config-editor-container">
            <div className="route-config-editor-content-wrapper">

                {/* Header - Hidden on small mobile to save space, visible on larger */}
                <div className="route-config-editor-header">
                    <h2 className="route-config-editor-title">
                        <Settings className="route-config-editor-title-icon" size={28} />
                        Konfigurace trasy
                    </h2>
                    <p className="route-config-editor-subtitle">
                        Upravte parametry pro výpočet ideální trasy.
                    </p>
                </div>

                {/* Configuration Grid/List */}
                {/* Mobile: Divide-y list | Desktop: Grid of cards */}
                <div className="route-config-editor-grid">

                    {/* Buffer Config */}
                    <div className="route-config-editor-card group">
                        <div className="route-config-editor-card-header">
                            <div className="route-config-editor-card-title-group">
                                <div className="route-config-editor-card-icon-wrapper">
                                    <Maximize size={20} />
                                </div>
                                <span className="route-config-editor-card-title">Okolí trasy</span>
                            </div>
                            <span className="route-config-editor-card-value">{bufferSize} <span className="route-config-editor-card-value-unit">km</span></span>
                        </div>

                        <p className="route-config-editor-card-desc">
                            Vzdálenost od čáry, kde hledáme zajímavá místa.
                        </p>

                        <div className="route-config-editor-controls">
                            <input
                                type="range"
                                min="1"
                                max="50"
                                step="1"
                                value={bufferSize}
                                onChange={(e) => setBufferSize(Number(e.target.value))}
                                className="route-config-editor-range-input"
                            />
                            <div className="route-config-editor-range-labels">
                                <span>1 km</span>
                                <span>50 km</span>
                            </div>
                        </div>
                    </div>

                    {/* Max Length Config */}
                    <div className="route-config-editor-card group">
                        <div className="route-config-editor-card-header">
                            <div className="route-config-editor-card-title-group">
                                <div className="route-config-editor-card-icon-wrapper">
                                    <Navigation size={20} />
                                </div>
                                <span className="route-config-editor-card-title">Denní limit</span>
                            </div>
                            <span className="route-config-editor-card-value">{maxRouteLength} <span className="route-config-editor-card-value-unit">km</span></span>
                        </div>

                        <p className="route-config-editor-card-desc">
                            Maximální délka trasy na jeden den.
                        </p>

                        <div className="route-config-editor-controls">
                            <input
                                type="range"
                                min="50"
                                max="1000"
                                step="50"
                                value={maxRouteLength}
                                onChange={(e) => setMaxRouteLength(Number(e.target.value))}
                                className="route-config-editor-range-input"
                            />
                            <div className="route-config-editor-range-labels">
                                <span>50 km</span>
                                <span>1000 km</span>
                            </div>
                        </div>
                    </div>

                    {/* POI Config */}
                    <div className="route-config-editor-card group">
                        <div className="route-config-editor-card-header">
                            <div className="route-config-editor-card-title-group">
                                <div className="route-config-editor-card-icon-wrapper">
                                    <Map size={20} />
                                </div>
                                <span className="route-config-editor-card-title">Hustota zastávek</span>
                            </div>
                            <span className="route-config-editor-card-value">{poiPerDay}</span>
                        </div>

                        <p className="route-config-editor-card-desc">
                            Kolik aktivit chcete stihnout za den.
                        </p>

                        <div className="route-config-editor-controls">
                            <input
                                type="range"
                                min="1"
                                max="15"
                                step="1"
                                value={poiPerDay}
                                onChange={(e) => setPoiPerDay(Number(e.target.value))}
                                className="route-config-editor-range-input"
                            />
                            <div className="route-config-editor-range-labels">
                                <span>1</span>
                                <span>15</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
});

export default RouteConfigurationEditor;
