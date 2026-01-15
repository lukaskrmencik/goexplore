import { useState } from "react";
import { useRouteAxis } from "./hooks/useRouteAxis";
import type { Route } from "../../../types/routes";
import LeafletMap from "../../leafletMap/components/LeafletMap";
import LocationSearch from "./components/LocationSearch";
import EditorMarkers from "./components/EditorMarkers";
import RoutePolyline from "./components/RoutePolyline";
import MapClickHandler from "./components/MapClickHandler";
import type { LatLngExpression } from "leaflet";

interface RouteAxisEditorProps {
    route: Route;
    onUpdate: (route: Route) => void;
}

const RouteAxisEditor: React.FC<RouteAxisEditorProps> = ({ route, onUpdate }) => {
    const { 
        points, 
        addPoint, 
        setStartPoint, 
        setEndPoint, 
        addSimpleWaypoint, 
        removePoint, 
        saveChanges,
        isSaving 
    } = useRouteAxis(route, onUpdate);

    const [customModeFinished, setCustomModeFinished] = useState(false);

    // Calculate Polyline coords
    const polylineCoords: LatLngExpression[] = points.map(p => [p.lat, p.lng]);

    // Custom Mode Click Handler
    const handleMapClick = (lat: number, lng: number) => {
        if (route.mode === 'manual' && !customModeFinished) {
            addPoint(lat, lng);
        }
    };

    const handleCustomFinish = async () => {
        // Last point becomes End, Save
        setCustomModeFinished(true);
        await saveChanges();
    };

    return (
        <div className="flex h-[calc(100vh-200px)] gap-4">
            {/* Sidebar Controls */}
            <div className="flex w-1/3 flex-col gap-6 overflow-y-auto rounded-xl border bg-white p-6 shadow-sm">
                
                {route.mode === 'simple' ? (
                    <>
                        <h3 className="text-xl font-bold text-gray-800">Plánovač trasy</h3>
                        
                        <LocationSearch 
                            label="Startovní bod" 
                            onSelect={(lat, lng, name) => setStartPoint(lat, lng, name)}
                            initialValue={points.find(p => p.type === 'start')?.name}
                        />

                        {/* Waypoints List */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">Zastávky (Waypointy)</label>
                            {points.filter(p => p.type === 'waypoint').map((wp, index) => (
                                <div key={wp.id} className="flex items-center justify-between rounded bg-gray-50 p-2">
                                    <span className="truncate text-sm">{wp.name}</span>
                                    <button 
                                        onClick={() => removePoint(wp.id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                            <LocationSearch 
                                label="Přidat zastávku" 
                                placeholder="Vyhledat místo..."
                                onSelect={(lat, lng, name) => addSimpleWaypoint(lat, lng, name)}
                            />
                        </div>

                        <LocationSearch 
                            label="Cílový bod" 
                            onSelect={(lat, lng, name) => setEndPoint(lat, lng, name)}
                            initialValue={points.find(p => p.type === 'end')?.name}
                        />

                        <button 
                            onClick={saveChanges}
                            disabled={isSaving}
                            className="mt-auto rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isSaving ? "Ukládám..." : "Uložit trasu"}
                        </button>
                    </>
                ) : (
                    <>
                        <h3 className="text-xl font-bold text-gray-800">Kreslení trasy</h3>
                        <p className="text-sm text-gray-600">
                            Klikáním do mapy vytvořte trasu. První bod je start, poslední bude cíl.
                        </p>
                        
                        <div className="flex flex-col gap-2">
                            <div className="rounded bg-gray-50 p-4">
                                <span className="font-bold">{points.length}</span> vybraných bodů
                            </div>
                            
                            {!customModeFinished ? (
                                <button 
                                    onClick={handleCustomFinish}
                                    disabled={points.length < 2}
                                    className="rounded-lg bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                                >
                                    Dokončit kreslení
                                </button>
                            ) : (
                                <div className="rounded-lg bg-green-100 p-4 text-center text-green-800">
                                    Trasa uložena! Můžete pokračovat.
                                </div>
                            )}
                            
                            <button 
                                onClick={() => {/* Reset logic */}} // TODO: Add reset
                                className="text-sm text-gray-500 underline"
                            >
                                Začít znovu
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Map Area */}
            <div className="relative flex-1 overflow-hidden rounded-xl border shadow-sm">
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
};

export default RouteAxisEditor;