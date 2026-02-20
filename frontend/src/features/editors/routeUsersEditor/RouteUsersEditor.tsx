import { useState, useEffect } from "react";
import { useRouteUsers } from "./hooks/useRouteUsers";
import InviteBox from "./components/InviteBox";
import Toast from "../../../components/ui/Toast";
import UserList from "./components/UserList";
import type { RouteEditorProps } from "../../../types/editor";
import { Users, ChevronUp } from "lucide-react";
import { fetchMyUser } from "../../../services/usersApiService";
import type { User as UserType } from "../../../types/users";

const RouteUsersEditor: React.FC<RouteEditorProps> = ({ route, onUpdate }) => {
    const {
        inviteLink,
        isGenerating,
        generateLink,
        removeUser,
        isRemovingId,
        error,
        clearError
    } = useRouteUsers(route, onUpdate);

    const [currentUser, setCurrentUser] = useState<UserType | null>(null);
    const [isCrewOpen, setIsCrewOpen] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const user = await fetchMyUser();
                setCurrentUser(user);
            } catch (err) {
                console.error("Failed to load current user", err);
            }
        };
        loadUser();
    }, []);

    // Owner (Current User) Object
    const ownerUser = currentUser ? {
        ...currentUser,
        role: "owner",
        pivot: {
            routes_id: route.id,
            users_id: currentUser.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
    } : null;

    // Combine users for display: Owner first, then others
    // @ts-ignore
    const allUsers = ownerUser ? [ownerUser, ...(route.users || [])] : [...(route.users || [])];

    return (
        <div className="w-full h-full flex flex-col md:flex-row bg-white overflow-hidden relative">

            {/* LEFT PANEL: Invite Action */}
            {/* Added extra bottom padding on mobile so content isn't covered by the collapsed sheet */}
            <div className="flex-1 flex flex-col justify-start md:justify-center p-6 pt-24 md:pt-6 z-10 relative safe-area-bottom pb-32 md:pb-6 overflow-hidden">
                <div className="max-w-md mx-auto w-full space-y-8">

                    {/* Header */}
                    <div className="space-y-3 text-center md:text-left">
                        <h2 className="text-4xl md:text-5xl font-heading font-bold text-slate-900 tracking-tight">
                            Kdo jede s námi?
                        </h2>
                        <p className="text-lg text-slate-500 font-medium">
                            Přidej kamarády a naplánujte to společně.
                        </p>
                    </div>

                    {/* Invite Card - Redesigned */}
                    <InviteBox
                        link={inviteLink}
                        isGenerating={isGenerating}
                        onGenerate={generateLink}
                    />

                </div>
            </div>

            {/* BACKDROP (Mobile Only) */}
            {isCrewOpen && (
                <div
                    className="absolute inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden transition-opacity border-none"
                    onClick={() => setIsCrewOpen(false)}
                />
            )}

            {/* RIGHT PANEL (Desktop) / BOTTOM SHEET (Mobile) */}
            <div
                className={`
                    absolute md:static inset-x-0 bottom-0 top-auto z-40
                    flex flex-col
                    bg-slate-50 md:bg-slate-50
                    border-t border-slate-200 md:border-none md:border-l md:border-slate-200
                    rounded-t-[32px] md:rounded-none
                    shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] md:shadow-2xl
                    transition-all duration-500 cubic-bezier(0.32, 0.72, 0, 1)
                    ${isCrewOpen ? 'h-[92%] translate-y-0' : 'h-16 translate-y-0'}
                    md:h-auto md:w-[420px] md:translate-y-0
                `}
            >
                {/* Drag Handle / Header (Mobile Toggle) */}
                <div
                    className="p-4 md:p-6 border-b border-slate-200 bg-white/50 backdrop-blur-xl sticky top-0 z-10 rounded-t-[32px] md:rounded-none cursor-pointer md:cursor-default group h-16 md:h-auto flex flex-col justify-center"
                    onClick={() => setIsCrewOpen(!isCrewOpen)}
                >
                    {/* Handle Indicator (Mobile only) */}
                    <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-2 md:hidden" />

                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wider">
                            <Users size={16} className="text-slate-400" />
                            Posádka ({allUsers.length})
                        </h3>

                        {/* Chevron indicator for mobile state */}
                        <ChevronUp
                            size={20}
                            className={`text-slate-400 md:hidden transition-transform duration-300 ${isCrewOpen ? 'rotate-180' : ''}`}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-6 pb-24 md:pb-6">
                    <UserList
                        users={allUsers}
                        currentUserId={ownerUser?.id || 0}
                        onRemove={removeUser}
                        isRemovingId={isRemovingId}
                    />
                </div>
            </div>

            {error && <Toast message={error} onClose={clearError} />}
        </div>
    );
};

export default RouteUsersEditor;
