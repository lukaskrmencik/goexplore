import React, { useState, useRef } from 'react'
import Map from '../../features/mapViewer/components/map/Map/Map'
import { useMapViewer } from "../../features/mapViewer/hooks/useMapViewer";
import { useLocation } from "react-router-dom";
import DetailSidebar from '../../features/mapViewer/components/DetailSidebar/DetailSidebar';
import RouteControlPanel from '../../features/mapViewer/components/RouteControlPanel/RouteControlPanel';
import CalculationOverlay from '../../features/mapViewer/components/CalculationOverlay/CalculationOverlay';
import { Loader2, Check } from 'lucide-react';
import Toast from '../../components/ui/Toast/Toast';

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

  if (!route) return <div className="map-viewer-loading"><Loader2 className="map-viewer-spinner text-emerald-600" /></div>;

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