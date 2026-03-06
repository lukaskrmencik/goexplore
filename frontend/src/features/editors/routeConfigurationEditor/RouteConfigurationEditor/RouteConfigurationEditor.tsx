import { forwardRef, useImperativeHandle, useEffect } from "react";
import { useRouteConfiguration } from ".././hooks/useRouteConfiguration";
import type { RouteConfigurationEditorHandle, RouteEditorProps } from "../../../../types/editor";
import { Settings, Maximize, Navigation, Map } from "lucide-react";
import ConfigSliderCard from "../components/ConfigSliderCard/ConfigSliderCard";
import "./RouteConfigurationEditor.css";

const BUFFER_MIN = Number(import.meta.env.VITE_CONFIG_BUFFER_MIN_KM ?? "10");
const BUFFER_MAX = Number(import.meta.env.VITE_CONFIG_BUFFER_MAX_KM ?? "50");
const ROUTE_LENGTH_MIN = Number(import.meta.env.VITE_CONFIG_ROUTE_LENGTH_MIN_KM ?? "50");
const ROUTE_LENGTH_MAX = Number(import.meta.env.VITE_CONFIG_ROUTE_LENGTH_MAX_KM ?? "1000");
const POI_MIN = Number(import.meta.env.VITE_CONFIG_POI_PER_DAY_MIN ?? "1");
const POI_MAX = Number(import.meta.env.VITE_CONFIG_POI_PER_DAY_MAX ?? "6");

const RouteConfigurationEditor = forwardRef<RouteConfigurationEditorHandle, RouteEditorProps>(({ route, onUpdate, onChange, estimatedRoadKm = 0 }, ref) => {
    const {
        bufferSize,
        maxRouteLength,
        poiPerDay,
        computedDailyLimit,
        handleBufferSizeChange,
        handleMaxRouteLengthChange,
        handlePoiPerDayChange,
        handleSave,
    } = useRouteConfiguration(route, onUpdate, estimatedRoadKm);

    const isSimpleMode = route.mode === 'simple';


    useEffect(() => {
        onChange?.();
    }, [bufferSize, maxRouteLength, poiPerDay, onChange]);


    useImperativeHandle(ref, () => ({
        save: async () => {
            await handleSave();
        },
    }));

    {/* --- START: AI-GENERATED UI (Claude 3.7 Sonnet Thinking) --- */}
    {/* Layout and structure generated from design. Data binding and variables added manually. */}

    return (
        <div className="route-config-editor-container">
            <div className="route-config-editor-content-wrapper">
                <div className="route-config-editor-header">
                    <h2 className="route-config-editor-title">
                        <Settings className="route-config-editor-title-icon" size={28} />
                        Nastavení trasy
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
                        onChange={handleBufferSizeChange}
                    />

                    <ConfigSliderCard
                        icon={<Navigation size={20} />}
                        title="Denní limit"
                        description={
                            isSimpleMode && computedDailyLimit !== null
                                ? `Výchozí z délky trasy: ${computedDailyLimit} km/den (lze upravit)`
                                : "Maximální délka trasy na jeden den."
                        }
                        value={maxRouteLength}
                        min={ROUTE_LENGTH_MIN}
                        max={ROUTE_LENGTH_MAX}
                        step={50}
                        unit="km"
                        onChange={handleMaxRouteLengthChange}
                    />

                    <ConfigSliderCard
                        icon={<Map size={20} />}
                        title="Hustota zastávek"
                        description="Kolik aktivit chcete stihnout za den."
                        value={poiPerDay}
                        min={POI_MIN}
                        max={POI_MAX}
                        step={1}
                        onChange={handlePoiPerDayChange}
                    />
                </div>
            </div>
        </div>
    );

    {/* --- END: AI-GENERATED UI --- */}
});

export default RouteConfigurationEditor;
