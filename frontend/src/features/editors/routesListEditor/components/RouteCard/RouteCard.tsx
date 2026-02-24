import type { RouteItem } from "../../../../../types/routes";
import { Map, Trash2, Share2, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MapContainer, GeoJSON, TileLayer } from "react-leaflet";
import UserAvatar from "../../../../../components/ui/UserAvatar/UserAvatar";
import "./RouteCard.css";

interface RouteCardProps {
    route: RouteItem;
    isShared?: boolean;
    onOpen: (id: number) => void;
    onDelete?: (id: number) => void;
    onUnjoin?: (id: number) => void;
}

// Helper to compute bounds from simplified GeoJSON LineString
const getGeoJSONBounds = (geojsonString: string): [[number, number], [number, number]] => {
    try {
        const geojson = JSON.parse(geojsonString);
        if (geojson.type === "LineString" && geojson.coordinates) {
            const coords: number[][] = geojson.coordinates;
            let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
            coords.forEach(coord => {
                const lng = coord[0];
                const lat = coord[1];
                if (lat < minLat) minLat = lat;
                if (lat > maxLat) maxLat = lat;
                if (lng < minLng) minLng = lng;
                if (lng > maxLng) maxLng = lng;
            });
            // Adding a small padding factor so points aren't exactly on the border
            const padLat = (maxLat - minLat) * 0.1 || 0.01;
            const padLng = (maxLng - minLng) * 0.1 || 0.01;
            return [
                [minLat - padLat, minLng - padLng],
                [maxLat + padLat, maxLng + padLng]
            ];
        }
    } catch (e) {
        console.error("Error parsing simplified_geojson", e);
    }
    // Fallback bounds (Czech Republic approximate)
    return [[48.5, 12.0], [51.0, 18.8]];
};

const RouteCard: React.FC<RouteCardProps> = ({ route, isShared, onOpen, onDelete, onUnjoin }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        onOpen(route.id);

        if (status === 'draft') {
            // Always go to the first wizard step for draft routes
            navigate(`/routes/${route.id}/location`);
        } else {
            navigate(`/map-viewer?id=${route.id}`);
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDelete) {
            onDelete(route.id);
        }
    };

    const handleUnjoin = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onUnjoin) {
            onUnjoin(route.id);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' });
    };

    const getStatus = () => {
        // A route is draft if calculation hasn't been run yet.
        // length_meters is computed from complete_route only, so it's the reliable indicator.
        // (simplified_geojson is unreliable — backend generates it from COALESCE(complete_route, axis))
        if (!route.length_meters) return "draft";

        if (!route.start_date) return "draft";

        const now = new Date();
        const start = new Date(route.start_date);
        const end = route.end_date ? new Date(route.end_date) : new Date(start.getTime() + 24 * 60 * 60 * 1000);

        if (end < now) return "past";
        if (start <= now && end >= now) return "active";
        return "future";
    };

    const status = getStatus();

    const formatLength = (meters?: number) => {
        if (!meters) return "- km";
        if (meters < 1000) return `${Math.round(meters)} m`;
        return `${(meters / 1000).toFixed(1)} km`;
    };

    // Status Styles
    const getStatusStyles = () => {
        switch (status) {
            case "active":
                return "route-card-status-active";
            case "past":
                return "route-card-status-past";
            case "future":
                return "route-card-status-future";
            case "draft":
                return "route-card-status-draft";
            default:
                return "route-card-status-default";
        }
    };

    const statusStyles = getStatusStyles();
    const isPast = status === "past";

    const getStatusLabel = () => {
        switch (status) {
            case "active": return "Probíhá";
            case "past": return "Proběhlo";
            case "future": return formatDate(route.start_date!);
            case "draft": return "Rozpracováno";
            default: return "";
        }
    };

    const getModeLabel = () => {
        if (route.mode === 'simple') return "Automatická";
        if (route.mode === 'manual') return "Manuální";
        return "Neznámý";
    };

    return (

        <div
            onClick={handleClick}
            className={`route-card-container group ${isPast ? 'route-card-is-past' : ''}`}
        >
            {/* Map Placeholder */}
            <div className="route-card-image-placeholder">
                {/* Simplified GeoJSON Map or Placeholder Pattern */}
                {route.simplified_geojson ? (
                    <MapContainer
                        bounds={getGeoJSONBounds(route.simplified_geojson)}
                        className="route-card-static-map"
                        zoomControl={false}
                        dragging={false}
                        scrollWheelZoom={false}
                        touchZoom={false}
                        doubleClickZoom={false}
                        attributionControl={false}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <GeoJSON
                            data={JSON.parse(route.simplified_geojson)}
                            style={{
                                color: "var(--color-primary-600)",
                                weight: 3,
                                opacity: 1
                            }}
                        />
                    </MapContainer>
                ) : (
                    <>
                        <div className="route-card-image-pattern"></div>
                        <div className="route-card-image-icon-wrapper">
                            <Map size={48} strokeWidth={1} />
                        </div>
                    </>
                )}



                {/* Status Badge (Top Left) */}
                <div className={`route-card-status-badge ${statusStyles}`}>
                    <span>
                        {getStatusLabel()}
                        {status === 'future' && route.end_date && ` - ${formatDate(route.end_date)}`}
                    </span>
                </div>
            </div>

            {/* Content Body */}
            <div className="route-card-body">
                {/* Title and Shared Badge*/}
                <div className="route-card-title-row">
                    <h3 className={`route-card-title ${isPast ? 'route-card-title-past' : 'route-card-title-active'}`}>
                        {route.name || "Cesta bez názvu"}
                    </h3>

                    {/* Shared By Inline Badge */}
                    {isShared && route.user && (
                        <div className="route-card-shared-inline-badge" title={`S vámi sdílí ${route.user.name}`}>
                            <Share2 size={10} className="route-card-shared-icon" />
                            <UserAvatar
                                name={route.user.name}
                                profilePicture={route.user.profile_picture}
                                size="sm" /* Ideally XS, but using SM inside a constrained container works too */
                            />
                            <span className="route-card-shared-name">
                                {route.user.name}
                            </span>
                        </div>
                    )}
                </div>

                {/* Date range / schedule info */}
                <div className="route-card-meta-row">
                    {route.start_date ? (
                        <span className="route-card-info-text">
                            {route.end_date
                                ? `Od ${formatDate(route.start_date)} do ${formatDate(route.end_date)}`
                                : `Datum: ${formatDate(route.start_date)}`}
                        </span>
                    ) : (
                        <span className="route-card-info-text">
                            Datum zatím není nastaveno
                        </span>
                    )}
                </div>

                {/* Conditional Content based on Status */}
                {status === 'draft' ? (
                    // DRAFT CONTENT - SIMPLIFIED
                    <div className="route-card-footer">
                        {/* Left: Created At */}
                        <div className="route-card-length-wrapper">
                            <span className="route-card-length-text">
                                {route.created_at ? `Vytvořeno: ${formatDate(route.created_at)}` : "Tato trasa je rozpracovaná"}
                            </span>
                        </div>

                        {/* Right: Mode & Shared */}
                        <div className="route-card-participants-wrapper">
                            <span className="route-card-mode-text">{getModeLabel()}</span>
                            {isShared && <Share2 size={14} className="route-card-share-icon" />}
                        </div>
                    </div>
                ) : (
                    // NORMAL CONTENT
                    <div className="route-card-footer">
                        {/* Left: Length */}
                        <div className="route-card-length-wrapper">
                            <span className="route-card-length-text">{formatLength(route.length_meters)}</span>
                        </div>

                        {/* Right: Participants */}
                        <div className="route-card-participants-wrapper">
                            <div className="route-card-avatars-stack">
                                {route.users && route.users.length > 0 ? (
                                    <>
                                        {route.users.slice(0, 4).map((u) => (
                                            <UserAvatar
                                                key={u.id}
                                                name={u.name}
                                                profilePicture={u.profile_picture}
                                                size="sm"
                                                className="route-card-avatar"
                                            />
                                        ))}
                                        {route.users.length > 4 && (
                                            <div className="route-card-avatar-overflow">
                                                +{route.users.length - 4}
                                            </div>
                                        )}
                                    </>
                                ) : null}
                            </div>

                            {/* Mode Label */}
                            <span className="route-card-mode-text">{getModeLabel()}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Button (Only for owned routes, assumed if !isShared) */}
            {!isShared ? (
                <button
                    className="route-card-delete-btn route-card-action-btn"
                    onClick={handleDelete}
                    title="Smazat cestu"
                >
                    <Trash2 size={16} />
                </button>
            ) : (
                <button
                    className="route-card-unjoin-btn route-card-action-btn"
                    onClick={handleUnjoin}
                    title="Odpojit se od trasy"
                >
                    <LogOut size={16} />
                </button>
            )}
        </div>
    );
};

export default RouteCard;
