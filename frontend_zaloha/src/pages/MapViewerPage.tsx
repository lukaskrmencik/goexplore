import React, { useState, useRef } from 'react'
import Map from '../features/mapViewer/components/map/Map'
import { useMapViewer } from "../features/mapViewer/hooks/useMapViewer";
import { useLocation } from "react-router-dom";
import DetailSidebar from '../features/mapViewer/components/DetailSidebar';
import RouteControlPanel from '../features/mapViewer/components/RouteControlPanel';
import CalculationOverlay from '../features/mapViewer/components/CalculationOverlay';
import { Loader2, Check } from 'lucide-react';
import Toast from '../components/ui/Toast';

// Editors
import RouteAxisEditor from '../features/editors/routeAxisEditor/RouteAxisEditor';
import RouteDateEditor from '../features/editors/routeDateEditor/RouteDateEditor';
import RouteUsersEditor from '../features/editors/routeUsersEditor/RouteUsersEditor';
import RouteEquipmentEditor from '../features/editors/routeEquipmentEditor/RouteEquipmentEditor';
import RouteConfigurationEditor from '../features/editors/routeConfigurationEditor/RouteConfigurationEditor';
import { calculateRoute, getCalculationProgress } from '../services/routesApiService';
import type { Route } from '../types/routes';
import type { RouteAxisEditorHandle, RouteDateEditorHandle, RouteConfigurationEditorHandle } from '../types/editor';

const MapViewerPage: React.FC = () => {

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const routeIdString = searchParams.get("id");
  const routeId = routeIdString ? parseInt(routeIdString) : null;

  const { route, pois, camps, clusters, routeLine, loading: _loading, setRoute, refetch } = useMapViewer(routeId);

  const [activeEditor, setActiveEditor] = useState<'axis' | 'date' | 'users' | 'equipment' | 'config' | null>(null);

  // Toast Error State
  const [toastError, setToastError] = useState<string | null>(null);

  // Editor Refs for Manual Saving
  const axisEditorRef = useRef<RouteAxisEditorHandle>(null);
  const dateEditorRef = useRef<RouteDateEditorHandle>(null);
  const configEditorRef = useRef<RouteConfigurationEditorHandle>(null);

  // Regeneration State
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenStatus, setRegenStatus] = useState("");
  const [regenProgress, setRegenProgress] = useState(0);
  const [regenError, setRegenError] = useState<string | null>(null);

  const [isDirty, setIsDirty] = useState(false);

  // Mobile Menu State (Lifted for restoration)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [wasMobileMenuOpen, setWasMobileMenuOpen] = useState(false);

  const [selectedItem, setSelectedItem] = React.useState<{ type: 'poi' | 'camp', id: number } | null>(null);

  const handlePoiClick = (id: number) => setSelectedItem({ type: 'poi', id });
  const handleCampClick = (id: number) => setSelectedItem({ type: 'camp', id });
  const handleCloseSidebar = () => setSelectedItem(null);

  // --- Handlers ---

  const handleRouteUpdate = (updatedRoute: Route) => {
    if (setRoute) setRoute(updatedRoute);
    setIsDirty(true);
  };

  const handleCloseEditor = () => {
    setActiveEditor(null);
    refetch();
    // Restore mobile menu if it was open before editor
    if (wasMobileMenuOpen) {
      setIsMobileMenuOpen(true);
      setWasMobileMenuOpen(false);
    }
  };

  const handleOpenEditor = (editor: 'axis' | 'date' | 'users' | 'equipment' | 'config') => {
    if (isMobileMenuOpen) {
      setWasMobileMenuOpen(true);
      setIsMobileMenuOpen(false);
    }
    setActiveEditor(editor);
  };

  const handleSaveAndClose = async () => {
    try {
      if (activeEditor === 'axis' && axisEditorRef.current) {
        await axisEditorRef.current.save();
      } else if (activeEditor === 'date' && dateEditorRef.current) {
        await dateEditorRef.current.save();
      } else if (activeEditor === 'config' && configEditorRef.current) {
        await configEditorRef.current.save();
      }
      // Users & Equipment save automatically
      handleCloseEditor();
    } catch (e: any) {
      console.error("Failed to save editor", e);
      let msg = "Nepodařilo se uložit změny.";
      if (e?.response?.data?.error_message) {
        msg = e.response.data.error_message;
      } else if (e?.response?.data?.message) {
        msg = e.response.data.message;
      } else if (e?.message) {
        msg = e.message;
      }
      setToastError(msg);
    }
  };

  const handleRegenerate = async () => {
    if (!route) return;
    if (route.id === 0) {
      setRegenError("Neplatné ID trasy");
      return;
    }

    setIsRegenerating(true);
    setRegenError(null);
    setRegenProgress(0);
    setRegenStatus("Spouštím výpočet...");

    try {
      const jobId = await calculateRoute(route.id);

      // Poll
      const interval = setInterval(async () => {
        try {
          const progress = await getCalculationProgress(jobId);

          if (progress.status) setRegenStatus(progress.status);

          // Fix: API returns 'progress', not 'percentage'
          if (typeof progress.progress === 'number') setRegenProgress(progress.progress);

          // Fix: API returns 'status' as 'done', not 'state' as 'completed'
          if (progress.status === 'done') {
            clearInterval(interval);
            setRegenProgress(100);

            // Short delay to show 100%
            setTimeout(() => {
              setIsRegenerating(false);
              setRegenStatus("");
              setRegenProgress(0);
              setIsDirty(false);
              refetch();
            }, 500);

          } else if (progress.status === 'failed' || progress.error) {
            console.error("Calculation failed state:", progress); // DEBUG
            clearInterval(interval);
            setRegenError(progress.error || "Neznámá chyba při výpočtu.");
          }
        } catch (e) {
          console.error("Polling error:", e); // DEBUG
          clearInterval(interval);
          setRegenError("Chyba komunikace se serverem.");
        }
      }, 1000);

    } catch (e: any) {
      console.error("Start calculation error:", e); // DEBUG
      setRegenError(e.message || "Nepodařilo se spustit výpočet.");
    }
  };

  if (!route) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>;

  const getEditorTitle = () => {
    switch (activeEditor) {
      case 'axis': return "Upravit trasu";
      case 'date': return "Vybrat termín";
      case 'users': return "Spravovat posádku";
      case 'equipment': return "Spravovat výbavu";
      case 'config': return "Nastavení trasy";
      default: return "";
    }
  };

  const isAutoSaveEditor = activeEditor === 'users' || activeEditor === 'equipment';

  return (
    <>
      <div className="w-full relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white h-[calc(100vh-9rem)] md:h-[calc(100vh-5rem)]">

        {/* MAP Layer: Hide if AxisEditor is full screen overlay? No, allow map to be seen behind backdrop */}
        <Map
          pois={pois}
          camps={camps}
          clusters={clusters}
          routeLine={routeLine}
          start={route?.start}
          end={route?.end}
          onPoiClick={handlePoiClick}
          onCampClick={handleCampClick}
        />

        {/* Control Panel (Vertical Sidebar) */}
        {!activeEditor && (
          <RouteControlPanel
            route={route}
            onRouteUpdate={handleRouteUpdate}
            onOpenEditor={handleOpenEditor} // Use wrapper
            onRegenerate={handleRegenerate}
            onError={(msg) => setToastError(msg)}
            isRegenerating={isRegenerating}
            regenProgress={regenProgress}
            isDirty={isDirty}
            isMobileOpen={isMobileMenuOpen}
            setIsMobileOpen={setIsMobileMenuOpen}
          />
        )}

        <DetailSidebar
          type={selectedItem?.type || null}
          id={selectedItem?.id || null}
          onClose={handleCloseSidebar}
        />

        {/* Regeneration Overlay - Only show on ERROR, progress is now in the button */}
        <CalculationOverlay
          isVisible={!!regenError}
          progress={regenProgress}
          status={regenStatus}
          error={regenError}
          onRetry={handleRegenerate}
          onCancel={() => { setIsRegenerating(false); setRegenError(null); }}
        />

        {/* Editor Modal Overlay (Popup Style) */}
        {activeEditor && (
          <div className="fixed top-14 bottom-[60px] left-0 right-0 z-[2000] md:absolute md:inset-0 md:z-[2000] bg-white md:bg-black/25 md:backdrop-blur-sm flex items-center justify-center p-0 md:p-6 animate-in fade-in duration-200">

            {/* Modal Container */}
            <div className="bg-white w-full h-full md:h-[90%] md:max-w-7xl rounded-none md:rounded-3xl shadow-none md:shadow-2xl overflow-hidden flex flex-col border-none md:border border-slate-100 ring-0 md:ring-1 ring-black/5">

              {/* Header */}
              <div className="flex-none px-6 py-4 flex justify-between items-center border-b border-slate-50 bg-white">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl md:text-2xl font-heading font-bold text-slate-900">
                    {getEditorTitle()}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveAndClose}
                    className={`
                        px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all
                        ${isAutoSaveEditor
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20'
                      }
                    `}
                  >
                    {!isAutoSaveEditor && <Check size={18} />}
                    {isAutoSaveEditor ? "Zavřít" : "Uložit a zavřít"}
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 relative overflow-hidden bg-white">
                {activeEditor === 'axis' && (
                  <div className="h-full">
                    <RouteAxisEditor ref={axisEditorRef} route={route} onUpdate={handleRouteUpdate} />
                  </div>
                )}

                {activeEditor === 'date' && (
                  <div className="h-full overflow-y-auto">
                    <RouteDateEditor ref={dateEditorRef} route={route} onUpdate={handleRouteUpdate} />
                  </div>
                )}

                {activeEditor === 'users' && (
                  <div className="h-full overflow-y-auto">
                    <RouteUsersEditor route={route} onUpdate={handleRouteUpdate} />
                  </div>
                )}

                {activeEditor === 'equipment' && (
                  <div className="h-full overflow-y-auto">
                    <RouteEquipmentEditor route={route} onUpdate={handleRouteUpdate} />
                  </div>
                )}

                {activeEditor === 'config' && (
                  <div className="h-full overflow-y-auto">
                    <RouteConfigurationEditor ref={configEditorRef} route={route} onUpdate={handleRouteUpdate} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Global Toast (Outside overflow-hidden container) */}
      {toastError && <Toast message={toastError} onClose={() => setToastError(null)} />}
    </>
  )
}
export default MapViewerPage;