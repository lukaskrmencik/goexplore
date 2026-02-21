import type { RouteItem } from "../../../../../types/routes";
import { Calendar, Map, Share2, Ruler, Clock, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import UserAvatar from "../../../../../components/ui/UserAvatar/UserAvatar";
import "./RouteCard.css";

interface RouteCardProps {
    route: RouteItem;
    isShared?: boolean;
    onOpen: (id: number) => void;
    onDelete?: (id: number) => void;
}

const RouteCard: React.FC<RouteCardProps> = ({ route, isShared, onOpen, onDelete }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        onOpen(route.id);
        if (status === 'draft') {
            navigate(`/routes/${route.id}/location`);
        } else {
            navigate(`/map-viewer?id=${route.id}`);
        }
    };

    const handleContinue = (e: React.MouseEvent) => {
        e.stopPropagation();
        onOpen(route.id);
        navigate(`/routes/${route.id}/location`);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDelete) {
            onDelete(route.id);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' });
    };

    const getStatus = () => {
        if (!route.start_date) return "draft";

        const now = new Date();
        const start = new Date(route.start_date);
        const end = route.end_date ? new Date(route.end_date) : new Date(start.getTime() + 24 * 60 * 60 * 1000); // Default 1 day if no end

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
                {/* Placeholder Pattern */}
                <div className="route-card-image-pattern">
                </div>

                <div className="route-card-image-icon-wrapper">
                    <Map size={48} strokeWidth={1} />
                </div>

                {/* Shared By Badge (Top Right) */}
                {isShared && route.user && (
                    <div className="route-card-shared-badge">
                        <UserAvatar
                            name={route.user.name}
                            profilePicture={route.user.profile_picture}
                            size="sm"
                        />
                        <span className="route-card-shared-name">
                            {route.user.name}
                        </span>
                    </div>
                )}

                {/* Status Badge (Top Left) */}
                <div className={`route-card-status-badge ${statusStyles}`}>
                    {status === 'active' ? <Clock size={12} className="route-card-status-icon-pulse" /> : <Calendar size={12} />}
                    <span>
                        {getStatusLabel()}
                        {status === 'future' && route.end_date && ` - ${formatDate(route.end_date)}`}
                    </span>
                </div>
            </div>

            {/* Content Body */}
            <div className="route-card-body">
                {/* Title */}
                <div className="route-card-title-row">
                    <h3 className={`route-card-title ${isPast ? 'route-card-title-past' : 'route-card-title-active'}`}>
                        {route.name || "Cesta bez názvu"}
                    </h3>
                </div>

                {/* Conditional Content based on Status */}
                {status === 'draft' ? (
                    // DRAFT CONTENT
                    <div className="route-card-draft-content">
                        <div className="route-card-draft-info">
                            <p className="route-card-draft-desc">
                                Tato trasa je rozpracovaná.
                            </p>
                            {route.created_at && (
                                <span className="route-card-info-text">
                                    Vytvořeno: {formatDate(route.created_at)}
                                </span>
                            )}
                            <span className="route-card-info-text">
                                Režim: {getModeLabel()}
                            </span>
                        </div>
                        <div className="route-card-draft-action-wrapper">
                            <button
                                onClick={handleContinue}
                                className="route-card-continue-btn"
                            >
                                Pokračovat ve vytváření
                            </button>
                        </div>
                    </div>
                ) : (
                    // NORMAL CONTENT
                    <div className="route-card-footer">
                        {/* Left: Length */}
                        <div className="route-card-length-wrapper">
                            <div className="route-card-length-icon-wrapper">
                                <Ruler size={14} />
                            </div>
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

                            {isShared && <Share2 size={14} className="route-card-share-icon" />}
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Button (Only for owned routes, assumed if !isShared) */}
            {!isShared && (
                <button
                    className="route-card-delete-btn"
                    onClick={handleDelete}
                    title="Smazat cestu"
                >
                    <Trash2 size={16} />
                </button>
            )}
        </div>
    );
};

export default RouteCard;
