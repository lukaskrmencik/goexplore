import type { RouteItem } from "../../../../../types/routes";
import { Map, Trash2, Share2, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MapContainer, GeoJSON, TileLayer } from "react-leaflet";
import UserAvatar from "../../../../../components/ui/UserAvatar/UserAvatar";
import { parseGeoJsonLineStringBounds } from "../../../../../utils/geo";
import { formatShortDate, formatShortTime } from "../../../../../utils/date";
import { getRouteStatus, getRouteStatusCssClass, getRouteStatusLabel, getRouteModeLabel } from "../../../../../utils/routeStatus";
import { formatRouteLength } from "../../../../../utils/format";
import "./RouteCard.css";

interface RouteCardProps {
    route: RouteItem;
    isShared?: boolean;
    onDelete?: (id: number) => void;
    onUnjoin?: (id: number) => void;
}

const RouteCard: React.FC<RouteCardProps> = ({ route, isShared, onDelete, onUnjoin }) => {
    const navigate = useNavigate();
    const status = getRouteStatus(route);
    const isPast = status === "past";

    const handleClick = () => {
        if (status === "draft") {
            navigate(`/routes/${route.id}/location`);
        } else {
            navigate(`/map-viewer?id=${route.id}`);
        }
    };

    const handleDelete = (event: React.MouseEvent) => {
        event.stopPropagation();
        onDelete?.(route.id);
    };

    const handleUnjoin = (event: React.MouseEvent) => {
        event.stopPropagation();
        onUnjoin?.(route.id);
    };

    const getStatusBadgeText = () => getRouteStatusLabel(status);

    {/* --- START: AI-GENERATED UI (Gemini 3.1 Pro) --- */}
    {/* Layout and structure generated from design. Data binding and variables added manually. */}

    return (
        <div
            onClick={handleClick}
            className={`route-card-container group ${isPast ? "route-card-is-past" : ""}`}
        >
            <div className="route-card-image-placeholder">
                {route.simplified_geojson ? (
                    <MapContainer
                        bounds={parseGeoJsonLineStringBounds(route.simplified_geojson)}
                        className="route-card-static-map"
                        zoomControl={false}
                        dragging={false}
                        scrollWheelZoom={false}
                        touchZoom={false}
                        doubleClickZoom={false}
                        attributionControl={false}
                    >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <GeoJSON
                            data={JSON.parse(route.simplified_geojson)}
                            style={{ color: "var(--color-primary-600)", weight: 3, opacity: 1 }}
                        />
                    </MapContainer>
                ) : (
                    <>
                        <div className="route-card-image-pattern" />
                        <div className="route-card-image-icon-wrapper">
                            <Map size={48} strokeWidth={1} />
                        </div>
                    </>
                )}

                <div className={`route-card-status-badge ${getRouteStatusCssClass(status)}`}>
                    <span>{getStatusBadgeText()}</span>
                </div>
            </div>

            <div className="route-card-body">
                <div className="route-card-title-row">
                    <h3 className={`route-card-title ${isPast ? "route-card-title-past" : "route-card-title-active"}`}>
                        {route.name || "Trasa bez názvu"}
                    </h3>

                    {isShared && route.user && (
                        <div className="route-card-shared-inline-badge" title={`S vámi sdílí ${route.user.name}`}>
                            <Share2 size={10} className="route-card-shared-icon" />
                            <UserAvatar
                                name={route.user.name}
                                profilePicture={route.user.profile_picture}
                                size="sm"
                            />
                            <span className="route-card-shared-name">{route.user.name}</span>
                        </div>
                    )}
                </div>

                <div className="route-card-meta-row">
                    {route.start_date ? (
                        <div className="route-card-dates">
                            <div className="route-card-date-block">
                                <span className="route-card-date-label">od</span>
                                <span className="route-card-date-value">{formatShortDate(route.start_date)}</span>
                                <span className="route-card-time-value">{formatShortTime(route.start_date)}</span>
                            </div>
                            {route.end_date && (
                                <div className="route-card-date-block">
                                    <span className="route-card-date-label">do</span>
                                    <span className="route-card-date-value">{formatShortDate(route.end_date)}</span>
                                    <span className="route-card-time-value">{formatShortTime(route.end_date)}</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <span className="route-card-info-text">Datum zatím není nastaveno</span>
                    )}
                </div>

                {status === "draft" ? (
                    <div className="route-card-footer">
                        <div className="route-card-length-wrapper">
                            <span className="route-card-length-text">
                                {route.created_at
                                    ? `Vytvořeno: ${formatShortDate(route.created_at)}`
                                    : "Tato trasa je rozpracovaná"}
                            </span>
                        </div>
                        <div className="route-card-participants-wrapper">
                            <span className="route-card-mode-text">{getRouteModeLabel(route.mode)}</span>
                            {isShared && <Share2 size={14} className="route-card-share-icon" />}
                        </div>
                    </div>
                ) : (
                    <div className="route-card-footer">
                        <div className="route-card-length-wrapper">
                            <span className="route-card-length-text">{formatRouteLength(route.length_meters)}</span>
                        </div>
                        <div className="route-card-participants-wrapper">
                            <div className="route-card-avatars-stack">
                                {route.users && route.users.length > 0 && (
                                    <>
                                        {route.users.slice(0, 4).map(user => (
                                            <UserAvatar
                                                key={user.id}
                                                name={user.name}
                                                profilePicture={user.profile_picture}
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
                                )}
                            </div>
                            <span className="route-card-mode-text">{getRouteModeLabel(route.mode)}</span>
                        </div>
                    </div>
                )}
            </div>

            {!isShared ? (
                <button
                    className="route-card-delete-btn route-card-action-btn"
                    onClick={handleDelete}
                    title="Smazat trasu"
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

    {/* --- END: AI-GENERATED UI --- */}
};

export default RouteCard;
