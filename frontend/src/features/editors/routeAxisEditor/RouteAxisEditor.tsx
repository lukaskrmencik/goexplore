import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { type LatLngExpression } from "leaflet";
import { useRouteAxis } from "./hooks/useRouteAxis";
import type { RouteAxisEditorHandle, RouteEditorProps } from "../../../types/editor";
import LeafletMap from "../../leafletMap/components/LeafletMap";
import LocationSearch from "./components/LocationSearch";
import EditorMarkers from "./components/EditorMarkers";
import RoutePolyline from "./components/RoutePolyline";
import MapClickHandler from "./components/MapClickHandler";
import { Navigation, Trash2, Check } from "lucide-react";

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
        <div className="relative w-full h-full flex flex-col md:flex-row overflow-hidden md:bg-white">

            {/* 1. SIDEBAR PANELS (Desktop: Relative, Mobile: Absolute Slide-up) */}
            <div className={`
                z-[20]
                md:relative md:w-[400px] md:h-full md:flex-none md:border-r md:border-slate-200 md:bg-white
                absolute bottom-0 left-0 right-0 w-full h-[calc(100%-10px)] md:w-auto md:pointer-events-auto
                pointer-events-none text-left
                transition-transform duration-300 ease-out
                ${isMobileExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-110px)]'} md:translate-y-0
            `}>
                {/* Inner Content Container */}
                <div className={`
                    flex flex-col h-full md:h-full
                    bg-white
                    shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.15)] md:shadow-none
                    rounded-t-[32px] md:rounded-none
                    overflow-hidden
                    pointer-events-auto
                    border-t border-slate-100 md:border-none
                `}>
                    {/* Mobile Handle / Toggle with Label */}
                    <div
                        className="md:hidden w-full py-3 flex flex-col items-center justify-center cursor-pointer active:bg-slate-50 border-b border-slate-50 transition-colors hover:bg-slate-50/50"
                        onClick={() => setIsMobileExpanded(!isMobileExpanded)}
                    >
                        <div className="w-12 h-1.5 bg-slate-300 rounded-full mb-1" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {isMobileExpanded ? 'Zavřít panel' : 'Upravit trasu'}
                        </span>
                    </div>

                    {/* Header specific to mode */}
                    <div className="px-5 pb-3 md:py-5 border-b border-slate-100 flex items-center justify-between flex-none bg-white">
                        <div className="flex items-center gap-3" onClick={() => setIsMobileExpanded(true)}>
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                <Navigation size={18} />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="font-heading font-bold text-slate-900 text-sm uppercase tracking-wider">
                                    {route.mode === 'simple' ? 'Plánovač' : 'Kreslení'}
                                </h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:block">
                                    {route.mode === 'simple' ? 'Trasa' : 'Ručně'}
                                </p>
                                <p className="text-[10px] font-bold text-emerald-600 md:hidden">
                                    {points.length} bodů • {isMobileExpanded ? 'Klepnutím sbalit' : 'Klepnutím upravit'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleReset}
                            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all"
                        >
                            <span className="hidden md:inline">Reset</span>
                            <Trash2 size={16} className="md:w-3 md:h-3 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>

                    {/* Content Scroll Area */}
                    {/* Extra padding at bottom to ensure last item is visible above the floating footer */}
                    <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-6 custom-scrollbar pb-36 md:pb-5">
                        {route.mode === 'simple' ? (
                            <>
                                <div className="space-y-4">
                                    <LocationSearch
                                        label="Start"
                                        placeholder="Odkud?"
                                        onSelect={(lat, lng, name) => setStartPoint(lat, lng, name)}
                                        initialValue={points.find(p => p.type === 'start')?.name}
                                    />

                                    {/* Waypoints List */}
                                    <div className="pl-4 ml-2 border-l-2 border-slate-200 space-y-3 py-1">
                                        {points.filter(p => p.type === 'waypoint').map((wp, index) => (
                                            <div key={wp.id} className="group flex items-center justify-between gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-100 hover:border-emerald-200 hover:shadow-sm transition-all">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <span className="flex-none w-5 h-5 rounded-full bg-slate-200 text-slate-500 text-[10px] font-bold flex items-center justify-center">
                                                        {index + 1}
                                                    </span>
                                                    <span className="truncate text-sm font-medium text-slate-700">{wp.name}</span>
                                                </div>
                                                <button onClick={() => removePoint(wp.id)} className="text-slate-300 hover:text-rose-500 transition-colors p-1">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}

                                        {/* Add Waypoint Trigger */}
                                        <div className="relative">
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
                                <p className="text-sm text-slate-600 leading-relaxed p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                                    Klikáním do mapy vytvořte trasu.
                                </p>

                                <div className="flex items-center justify-between bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Body</span>
                                        <span className="text-[10px] text-emerald-600/80 font-medium">Počet</span>
                                    </div>
                                    <span className="text-3xl font-heading font-bold text-emerald-600">{points.length}</span>
                                </div>

                                {!customModeFinished ? (
                                    <button
                                        onClick={handleCustomFinish}
                                        disabled={points.length < 2}
                                        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:shadow-none disabled:translate-y-0 transition-all flex items-center justify-center gap-2"
                                    >
                                        <span>Dokončit</span>
                                        <Check size={18} />
                                    </button>
                                ) : (
                                    <div className="p-4 bg-emerald-100/50 border border-emerald-200/50 rounded-2xl text-center">
                                        <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full mx-auto mb-2">
                                            <Check size={20} />
                                        </div>
                                        <p className="text-emerald-900 font-bold text-sm">Hotovo!</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. THE MAP (Desktop: Flex-1, Mobile: Absolute Full) */}
            <div className={`
                flex-1 relative h-full z-0
                md:order-2
                ${route.mode === 'manual' && !customModeFinished ? 'cursor-crosshair' : ''}
            `}>
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