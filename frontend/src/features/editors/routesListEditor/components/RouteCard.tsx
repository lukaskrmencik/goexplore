import type { RouteItem } from "../../../../types/routes";
import { Calendar, Map, Share2, Ruler, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import UserAvatar from "../../../../components/ui/UserAvatar";

interface RouteCardProps {
    route: RouteItem;
    isShared?: boolean;
    onOpen: (id: number) => void;
}

const RouteCard: React.FC<RouteCardProps> = ({ route, isShared, onOpen }) => {
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
                return "bg-emerald-100 text-emerald-700 border-emerald-200";
            case "past":
                return "bg-slate-100 text-slate-500 border-slate-200 grayscale";
            case "future":
                return "bg-blue-50 text-blue-700 border-blue-100";
            case "draft":
                return "bg-amber-100 text-amber-700 border-amber-200";
            default:
                return "bg-slate-50 text-slate-600 border-slate-200";
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

    return (

        <div
            onClick={handleClick}
            className={`group relative bg-white rounded-2xl border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col h-full ${isPast ? 'opacity-80 hover:opacity-100' : ''}`}
        >
            {/* Map Placeholder */}
            <div className="h-40 bg-slate-100 relative overflow-hidden border-b border-slate-100">
                {/* Placeholder Pattern */}
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '10px 10px' }}>
                </div>

                <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                    <Map size={48} strokeWidth={1} />
                </div>

                {/* Shared By Badge (Top Right) */}
                {isShared && route.user && (
                    <div className="absolute top-3 right-3 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm border border-slate-100 z-10">
                        <UserAvatar
                            name={route.user.name}
                            profilePicture={route.user.profile_picture}
                            size="sm"
                        />
                        <span className="text-xs font-medium text-slate-600 truncate max-w-[100px]">
                            {route.user.name}
                        </span>
                    </div>
                )}

                {/* Status Badge (Top Left) */}
                <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm border flex items-center gap-1.5 z-10 ${statusStyles}`}>
                    {status === 'active' ? <Clock size={12} className="animate-pulse" /> : <Calendar size={12} />}
                    <span>
                        {getStatusLabel()}
                        {status === 'future' && route.end_date && ` - ${formatDate(route.end_date)}`}
                    </span>
                </div>
            </div>

            {/* Content Body */}
            <div className="p-4 flex flex-col flex-1 gap-2">
                {/* Title */}
                <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className={`font-heading font-bold text-lg leading-tight transition-colors line-clamp-2 ${isPast ? 'text-slate-600' : 'text-slate-900 group-hover:text-emerald-700'}`}>
                        {route.name || "Cesta bez názvu"}
                    </h3>
                </div>

                {/* Conditional Content based on Status */}
                {status === 'draft' ? (
                    // DRAFT CONTENT
                    <div className="flex flex-col flex-1">
                        <p className="text-sm text-slate-500 mb-6 font-medium">
                            Tato trasa je rozpracovaná.
                        </p>
                        <div className="mt-auto">
                            <button
                                onClick={handleContinue}
                                className="w-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold py-2 rounded-xl text-sm shadow-sm hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
                            >
                                Pokračovat ve vytváření
                            </button>
                        </div>
                    </div>
                ) : (
                    // NORMAL CONTENT
                    <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between">
                        {/* Left: Length */}
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                            <div className="p-1.5 rounded-md bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                <Ruler size={14} />
                            </div>
                            <span className="text-slate-600">{formatLength(route.length_meters)}</span>
                        </div>

                        {/* Right: Participants */}
                        <div className="flex items-center gap-2">
                            <div className="flex items-center -space-x-2 overflow-hidden pl-1">
                                {route.users && route.users.length > 0 ? (
                                    <>
                                        {route.users.slice(0, 4).map((u) => (
                                            <UserAvatar
                                                key={u.id}
                                                name={u.name}
                                                profilePicture={u.profile_picture}
                                                size="sm"
                                                className="ring-2 ring-white w-7 h-7 text-[10px]"
                                            />
                                        ))}
                                        {route.users.length > 4 && (
                                            <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-slate-500">
                                                +{route.users.length - 4}
                                            </div>
                                        )}
                                    </>
                                ) : null}
                            </div>

                            {isShared && <Share2 size={14} className="text-slate-300 ml-1" />}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RouteCard;
