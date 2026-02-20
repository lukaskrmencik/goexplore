import { forwardRef, useImperativeHandle, useEffect } from "react";
import { useRouteConfiguration } from "./hooks/useRouteConfiguration";
import type { RouteConfigurationEditorHandle, RouteEditorProps } from "../../../types/editor";
import { Settings, Maximize, Navigation, Map } from "lucide-react";

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
        <div className="w-full h-full flex items-start md:items-center justify-center p-0 md:p-4 bg-slate-50">
            <div className="w-full max-w-5xl animate-in fade-in zoom-in-95 duration-300">

                {/* Header - Hidden on small mobile to save space, visible on larger */}
                <div className="text-center py-4 md:mb-8 md:py-0">
                    <h2 className="text-xl md:text-3xl font-heading font-bold text-slate-900 flex items-center justify-center gap-2 md:gap-3">
                        <Settings className="text-emerald-600 hidden md:block" size={28} />
                        Konfigurace trasy
                    </h2>
                    <p className="text-slate-500 text-xs md:text-base mt-1 px-4 hidden sm:block">
                        Upravte parametry pro výpočet ideální trasy.
                    </p>
                </div>

                {/* Configuration Grid/List */}
                {/* Mobile: Divide-y list | Desktop: Grid of cards */}
                <div className="flex flex-col md:grid md:grid-cols-3 gap-0 md:gap-6 bg-white md:bg-transparent divide-y divide-slate-100 md:divide-y-0 text-slate-900">

                    {/* Buffer Config */}
                    <div className="p-4 md:p-5 md:bg-white md:rounded-2xl md:border md:border-slate-200 md:shadow-sm md:hover:border-emerald-300 md:hover:shadow-md transition-all group flex flex-col h-auto md:h-full">
                        <div className="flex items-center justify-between mb-2 md:mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 text-slate-600 rounded-xl group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                    <Maximize size={20} />
                                </div>
                                <span className="font-heading font-bold text-slate-900 text-base md:text-lg">Okolí trasy</span>
                            </div>
                            <span className="text-lg md:text-xl font-heading font-bold text-emerald-600">{bufferSize} <span className="text-xs md:text-sm text-slate-400 font-medium">km</span></span>
                        </div>

                        <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4 hidden md:block min-h-[2.5em]">
                            Vzdálenost od čáry, kde hledáme zajímavá místa.
                        </p>

                        <div className="mt-auto">
                            <input
                                type="range"
                                min="1"
                                max="50"
                                step="1"
                                value={bufferSize}
                                onChange={(e) => setBufferSize(Number(e.target.value))}
                                className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-emerald-600 hover:accent-emerald-700 focus:outline-none"
                            />
                            <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                <span>1 km</span>
                                <span>50 km</span>
                            </div>
                        </div>
                    </div>

                    {/* Max Length Config */}
                    <div className="p-4 md:p-5 md:bg-white md:rounded-2xl md:border md:border-slate-200 md:shadow-sm md:hover:border-emerald-300 md:hover:shadow-md transition-all group flex flex-col h-auto md:h-full">
                        <div className="flex items-center justify-between mb-2 md:mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 text-slate-600 rounded-xl group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                    <Navigation size={20} />
                                </div>
                                <span className="font-heading font-bold text-slate-900 text-base md:text-lg">Denní limit</span>
                            </div>
                            <span className="text-lg md:text-xl font-heading font-bold text-emerald-600">{maxRouteLength} <span className="text-xs md:text-sm text-slate-400 font-medium">km</span></span>
                        </div>

                        <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4 hidden md:block min-h-[2.5em]">
                            Maximální délka trasy na jeden den.
                        </p>

                        <div className="mt-auto">
                            <input
                                type="range"
                                min="50"
                                max="1000"
                                step="50"
                                value={maxRouteLength}
                                onChange={(e) => setMaxRouteLength(Number(e.target.value))}
                                className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-emerald-600 hover:accent-emerald-700 focus:outline-none"
                            />
                            <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                <span>50 km</span>
                                <span>1000 km</span>
                            </div>
                        </div>
                    </div>

                    {/* POI Config */}
                    <div className="p-4 md:p-5 md:bg-white md:rounded-2xl md:border md:border-slate-200 md:shadow-sm md:hover:border-emerald-300 md:hover:shadow-md transition-all group flex flex-col h-auto md:h-full">
                        <div className="flex items-center justify-between mb-2 md:mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 text-slate-600 rounded-xl group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                    <Map size={20} />
                                </div>
                                <span className="font-heading font-bold text-slate-900 text-base md:text-lg">Hustota zastávek</span>
                            </div>
                            <span className="text-lg md:text-xl font-heading font-bold text-emerald-600">{poiPerDay}</span>
                        </div>

                        <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4 hidden md:block min-h-[2.5em]">
                            Kolik aktivit chcete stihnout za den.
                        </p>

                        <div className="mt-auto">
                            <input
                                type="range"
                                min="1"
                                max="15"
                                step="1"
                                value={poiPerDay}
                                onChange={(e) => setPoiPerDay(Number(e.target.value))}
                                className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-emerald-600 hover:accent-emerald-700 focus:outline-none"
                            />
                            <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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
