import React, { useState, useEffect } from 'react'
import { useLocation } from "react-router-dom";
import { Loader2 } from 'lucide-react';
import { useMapViewer } from "../hooks/useMapViewer";
import { useRouteRegeneration } from "../hooks/useRouteRegeneration";
import { useEditorState } from "../hooks/useEditorState";
import Map from '../components/map/Map/Map';
import DetailSidebar from '../components/DetailSidebar/DetailSidebar/DetailSidebar';
import RouteControlPanel from '../components/RouteControlPanel/RouteControlPanel/RouteControlPanel';
import CalculationOverlay from '../components/CalculationOverlay/CalculationOverlay';
import EditorModal from '../components/EditorModal/EditorModal';
import RouteGeneratingPlaceholder from '../components/RouteGeneratingPlaceholder/RouteGeneratingPlaceholder';
import Toast from '../../../components/ui/Toast/Toast';
import type { Route } from '../../../types/routes';
import "./MapViewer.css";

const MapViewer: React.FC = () => {
    const location = useLocation();
    const routeId = new URLSearchParams(location.search).get("id");
    const parsedRouteId = routeId ? parseInt(routeId) : null;

    const [toastError, setToastError] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<{ type: 'poi' | 'camp'; id: number } | null>(null);

    const {
        route,
        pois,
        camps,
        clusters,
        routeLine,
        visibleCrewMembers,
        visibleOwner,
        setRoute,
        refetch,
    } = useMapViewer(parsedRouteId);

    const {
        isRegenerating,
        regenStatus,
        regenProgress,
        regenError,
        isDirty,
        markAsDirty,
        handleRegenerate,
        clearRegenError,
    } = useRouteRegeneration(parsedRouteId, refetch);

    const {
        activeEditor,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        editorTitle,
        isAutoSaveEditor,
        editorRefs,
        handleOpenEditor,
        handleSaveAndClose,
    } = useEditorState(refetch, setToastError);

    const handleRouteUpdate = (updatedRoute: Route) => {
        setRoute(updatedRoute);
        markAsDirty();
    };

    const handleRouteUpdateSilent = (updatedRoute: Route) => {
        setRoute(updatedRoute);
    };

    useEffect(() => {
        if (!route || activeEditor || isRegenerating) return;

        const isRouteComplete = !!route.complete_route;
        const pollingDelay = isRouteComplete
            ? Number(import.meta.env.VITE_MAP_VIEWER_POLLING_COMPLETE ?? "15000")
            : Number(import.meta.env.VITE_MAP_VIEWER_POLLING_GENERATING ?? "5000");

        const interval = setInterval(refetch, pollingDelay);
        return () => clearInterval(interval);
    }, [route?.id, route?.complete_route, activeEditor, isRegenerating, refetch]);

    if (!route) return <div className="map-viewer-loading"><Loader2 className="map-viewer-spinner" /></div>;

    if (!route.complete_route && !activeEditor) return <RouteGeneratingPlaceholder />;

    return (
        <>
            <div className="map-viewer-container">
                <Map
                    key={route.id}
                    pois={pois}
                    camps={camps}
                    clusters={clusters}
                    routeLine={routeLine}
                    start={route.start}
                    end={route.end}
                    users={visibleCrewMembers}
                    user={visibleOwner}
                    onPoiClick={(id) => setSelectedItem({ type: 'poi', id })}
                    onCampClick={(id) => setSelectedItem({ type: 'camp', id })}
                />

                {!activeEditor && (
                    <RouteControlPanel
                        route={route}
                        onRouteUpdate={handleRouteUpdate}
                        onOpenEditor={handleOpenEditor}
                        onRegenerate={handleRegenerate}
                        onError={setToastError}
                        isRegenerating={isRegenerating}
                        regenProgress={regenProgress}
                        isDirty={isDirty}
                        isMobileOpen={isMobileMenuOpen}
                        setIsMobileOpen={setIsMobileMenuOpen}
                    />
                )}

                <DetailSidebar
                    type={selectedItem?.type ?? null}
                    id={selectedItem?.id ?? null}
                    onClose={() => setSelectedItem(null)}
                />

                <CalculationOverlay
                    isVisible={!!regenError}
                    progress={regenProgress}
                    status={regenStatus}
                    error={regenError}
                    onRetry={handleRegenerate}
                    onCancel={clearRegenError}
                />

                {activeEditor && (
                    <EditorModal
                        activeEditor={activeEditor}
                        editorTitle={editorTitle}
                        isAutoSaveEditor={isAutoSaveEditor}
                        route={route}
                        editorRefs={editorRefs}
                        onSaveAndClose={handleSaveAndClose}
                        onRouteUpdate={handleRouteUpdate}
                        onRouteUpdateSilent={handleRouteUpdateSilent}
                    />
                )}
            </div>

            {toastError && <Toast message={toastError} onClose={() => setToastError(null)} />}
        </>
    );
};

export default MapViewer;
