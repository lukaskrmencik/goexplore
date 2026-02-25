import React, { useState, useRef, useEffect } from 'react'
import Map from '../../features/mapViewer/components/map/Map/Map'
import { useMapViewer } from "../../features/mapViewer/hooks/useMapViewer";
import { useLocation } from "react-router-dom";
import DetailSidebar from '../../features/mapViewer/components/DetailSidebar/DetailSidebar';
import RouteControlPanel from '../../features/mapViewer/components/RouteControlPanel/RouteControlPanel';
import CalculationOverlay from '../../features/mapViewer/components/CalculationOverlay/CalculationOverlay';
import { Loader2, Check } from 'lucide-react';
import Toast from '../../components/ui/Toast/Toast';
import { fetchMyProfile } from '../../services/userApiService';
import type { User } from '../../types/users';
import { getErrorMessage } from '../../utils/apiError';

// Editors
import RouteAxisEditor from '../../features/editors/routeAxisEditor/RouteAxisEditor/RouteAxisEditor';
import RouteDateEditor from '../../features/editors/routeDateEditor/RouteDateEditor/RouteDateEditor';
import RouteUsersEditor from '../../features/editors/routeUsersEditor/RouteUsersEditor/RouteUsersEditor';
import RouteEquipmentEditor from '../../features/editors/routeEquipmentEditor/RouteEquipmentEditor/RouteEquipmentEditor';
import RouteConfigurationEditor from '../../features/editors/routeConfigurationEditor/RouteConfigurationEditor/RouteConfigurationEditor';
import { calculateRoute, getCalculationProgress } from '../../services/routesApiService';
import type { Route } from '../../types/routes';
import type { RouteAxisEditorHandle, RouteDateEditorHandle, RouteConfigurationEditorHandle } from '../../types/editor';
import "./MapViewerPage.css";

const MapViewerPage: React.FC = () => {

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const routeIdString = searchParams.get("id");
  const routeId = routeIdString ? parseInt(routeIdString) : null;

  const { route, pois, camps, clusters, routeLine, loading: _loading, setRoute, refetch } = useMapViewer(routeId);

  const [activeEditor, setActiveEditor] = useState<'axis' | 'date' | 'users' | 'equipment' | 'config' | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    fetchMyProfile().then(setCurrentUser).catch(console.error);
  }, []);

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
      setToastError(getErrorMessage(e, "Nepodařilo se uložit změny."));
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

    console.log("Starting regeneration for route:", route.id); // DEBUG

    try {
      const jobId = await calculateRoute(route.id);
      console.log("Job started, ID:", jobId); // DEBUG

      // Poll
      const interval = setInterval(async () => {
        try {
          const progress = await getCalculationProgress(jobId);
          console.log("Poll progress:", progress); // DEBUG

          if (progress.status) setRegenStatus(progress.status);

          // Fix: API returns 'progress', not 'percentage'
          if (typeof progress.progress === 'number') setRegenProgress(progress.progress);

          // Fix: API returns 'status' as 'done', not 'state' as 'completed'
          if (progress.status === 'done') {
            clearInterval(interval);
            console.log("Calculation completed!"); // DEBUG
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

  // Polling for map viewer updates (completion / location tracking)
  useEffect(() => {
    let interval: NodeJS.Timeout;

    // We only poll if we have a route, aren't actively editing, and aren't regenerating it
    if (route && !activeEditor && !isRegenerating) {
      const isComplete = !!route.complete_route;
      const delay = isComplete
        ? Number(import.meta.env.VITE_MAP_VIEWER_POLLING_COMPLETE ?? "15000")
        : Number(import.meta.env.VITE_MAP_VIEWER_POLLING_GENERATING ?? "5000");

      interval = setInterval(() => {
        refetch();
      }, delay);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [route?.id, route?.complete_route, activeEditor, isRegenerating, refetch]);

  if (!route) return <div className="map-viewer-loading"><Loader2 className="map-viewer-spinner text-emerald-600" /></div>;

  // View state for incomplete routes (blocks the map for invited users)
  // We only show this if they aren't actively editing it (owners will be in 'axis' editor etc)
  if (route && !route.complete_route && !activeEditor) {
    return (
      <div className="map-viewer-generating-container">
        <Loader2 size={48} className="map-viewer-spinner map-viewer-generating-icon" />
        <h2 className="map-viewer-generating-title">Trasa se právě zpracovává</h2>
        <p className="map-viewer-generating-desc">
          Prosím vyčkejte. Organizátor trasy ji právě vytváří nebo systém propočítává body v mapě. Tato stránka se automaticky načte, jakmile bude trasa připravena.
        </p>
      </div>
    );
  }

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
      <div className="map-viewer-container">

        {/* MAP Layer: Hide if AxisEditor is full screen overlay? No, allow map to be seen behind backdrop */}
        <Map
          key={route?.id}
          pois={pois}
          camps={camps}
          clusters={clusters}
          routeLine={routeLine}
          start={route?.start}
          end={route?.end}
          users={route?.users?.filter(u => u.id !== currentUser?.id)}
          user={route?.user?.id === currentUser?.id ? undefined : route?.user}
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
            onError={(msg: string) => setToastError(msg)}
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
          <div className="map-viewer-editor-overlay">

            {/* Modal Container */}
            <div className="map-viewer-modal-container">

              {/* Header */}
              <div className="map-viewer-modal-header">
                <div className="map-viewer-modal-header-left">
                  <h2 className="map-viewer-modal-title">
                    {getEditorTitle()}
                  </h2>
                </div>

                <div className="map-viewer-modal-header-right">
                  <button
                    onClick={handleSaveAndClose}
                    className={`
                        map-viewer-modal-btn
                        ${isAutoSaveEditor
                        ? 'map-viewer-modal-btn-autosave'
                        : 'map-viewer-modal-btn-save'
                      }
                    `}
                  >
                    {!isAutoSaveEditor && <Check size={18} />}
                    {isAutoSaveEditor ? "Zavřít" : "Uložit a zavřít"}
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="map-viewer-modal-content">
                {activeEditor === 'axis' && (
                  <div className="map-viewer-editor-container">
                    <RouteAxisEditor ref={axisEditorRef} route={route} onUpdate={handleRouteUpdate} />
                  </div>
                )}

                {activeEditor === 'date' && (
                  <div className="map-viewer-editor-container-scrollable">
                    <RouteDateEditor ref={dateEditorRef} route={route} onUpdate={handleRouteUpdate} />
                  </div>
                )}

                {activeEditor === 'users' && (
                  <div className="map-viewer-editor-container-scrollable">
                    <RouteUsersEditor route={route} onUpdate={handleRouteUpdate} />
                  </div>
                )}

                {activeEditor === 'equipment' && (
                  <div className="map-viewer-editor-container-scrollable">
                    <RouteEquipmentEditor route={route} onUpdate={handleRouteUpdate} />
                  </div>
                )}

                {activeEditor === 'config' && (
                  <div className="map-viewer-editor-container-scrollable">
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