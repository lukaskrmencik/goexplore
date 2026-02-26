import { forwardRef, useImperativeHandle, useEffect } from "react";
import { useRouteConfiguration } from ".././hooks/useRouteConfiguration";
import type { RouteConfigurationEditorHandle, RouteEditorProps } from "../../../../types/editor";
import { Settings, Maximize, Navigation, Map } from "lucide-react";
import ConfigSliderCard from "../components/ConfigSliderCard/ConfigSliderCard";
import "./RouteConfigurationEditor.css";

const BUFFER_MIN = Number(import.meta.env.VITE_CONFIG_BUFFER_MIN_KM ?? "1");
const BUFFER_MAX = Number(import.meta.env.VITE_CONFIG_BUFFER_MAX_KM ?? "50");
const ROUTE_LENGTH_MIN = Number(import.meta.env.VITE_CONFIG_ROUTE_LENGTH_MIN_KM ?? "50");
const ROUTE_LENGTH_MAX = Number(import.meta.env.VITE_CONFIG_ROUTE_LENGTH_MAX_KM ?? "1000");
const POI_MIN = Number(import.meta.env.VITE_CONFIG_POI_PER_DAY_MIN ?? "1");
const POI_MAX = Number(import.meta.env.VITE_CONFIG_POI_PER_DAY_MAX ?? "15");

const RouteConfigurationEditor = forwardRef<RouteConfigurationEditorHandle, RouteEditorProps>(({ route, onUpdate, onChange }, ref) => {
    const {
        bufferSize,
        setBufferSize,
        maxRouteLength,
        setMaxRouteLength,
        poiPerDay,
        setPoiPerDay,
        handleSave,
    } = useRouteConfiguration(route, onUpdate);

    useEffect(() => {
        onChange?.();
    }, [bufferSize, maxRouteLength, poiPerDay, onChange]);

    useImperativeHandle(ref, () => ({
        save: async () => {
            await handleSave();
        },
    }));

    return (
        <div className="route-config-editor-container">
            <div className="route-config-editor-content-wrapper">
                <div className="route-config-editor-header">
                    <h2 className="route-config-editor-title">
                        <Settings className="route-config-editor-title-icon" size={28} />
                        Konfigurace trasy
                    </h2>
                    <p className="route-config-editor-subtitle">
                        Upravte parametry pro výpočet ideální trasy.
                    </p>
                </div>

                <div className="route-config-editor-grid">
                    <ConfigSliderCard
                        icon={<Maximize size={20} />}
                        title="Okolí trasy"
                        description="Vzdálenost od čáry, kde hledáme zajímavá místa."
                        value={bufferSize}
                        min={BUFFER_MIN}
                        max={BUFFER_MAX}
                        step={1}
                        unit="km"
                        onChange={setBufferSize}
                    />

                    <ConfigSliderCard
                        icon={<Navigation size={20} />}
                        title="Denní limit"
                        description="Maximální délka trasy na jeden den."
                        value={maxRouteLength}
                        min={ROUTE_LENGTH_MIN}
                        max={ROUTE_LENGTH_MAX}
                        step={50}
                        unit="km"
                        onChange={setMaxRouteLength}
                    />

                    <ConfigSliderCard
                        icon={<Map size={20} />}
                        title="Hustota zastávek"
                        description="Kolik aktivit chcete stihnout za den."
                        value={poiPerDay}
                        min={POI_MIN}
                        max={POI_MAX}
                        step={1}
                        onChange={setPoiPerDay}
                    />
                </div>
            </div>
        </div>
    );
});

export default RouteConfigurationEditor;
