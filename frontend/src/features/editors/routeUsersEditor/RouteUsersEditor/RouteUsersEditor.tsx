import { useState, useEffect } from "react";
import { useRouteUsers } from ".././hooks/useRouteUsers";
import InviteBox from ".././components/InviteBox/InviteBox";
import Toast from "../../../../components/ui/Toast/Toast";
import ConfirmDialog from "../../../../components/ui/ConfirmDialog/ConfirmDialog";
import UserList from ".././components/UserList/UserList";
import type { RouteEditorProps } from "../../../../types/editor";
import { Users, ChevronUp } from "lucide-react";
import { fetchMyUser } from "../../../../services/usersApiService";
import { fetchGetRoute } from "../../../../services/routesApiService";
import type { User as UserType } from "../../../../types/users";
import "./RouteUsersEditor.css";

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
    const [userToRemove, setUserToRemove] = useState<number | null>(null);

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

    // Refetch full route when entering this step so users + owner are always shown (avoids empty list when navigating from another step)
    useEffect(() => {
        if (!route?.id) return;
        fetchGetRoute(route.id).then(onUpdate).catch((err) => console.error("Failed to load route users", err));
    }, [route?.id]);

    // Owner Object (fetched from route.user)
    const ownerUser = route.user ? {
        ...route.user,
        role: "owner",
        pivot: {
            routes_id: route.id,
            users_id: route.user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
    } : null;

    // Combine users for display: Owner first, then others
    // @ts-ignore
    const allUsers = ownerUser ? [ownerUser, ...(route.users || [])] : [...(route.users || [])];

    return (
        <div className="route-users-editor-container">

            {/* LEFT PANEL: Invite Action */}
            {/* Added extra bottom padding on mobile so content isn't covered by the collapsed sheet */}
            <div className="route-users-editor-left-panel">
                <div className="route-users-editor-content-wrapper">

                    {/* Header */}
                    <div className="route-users-editor-header">
                        <h2 className="route-users-editor-title">
                            Sdílení trasy
                        </h2>
                        <p className="route-users-editor-subtitle">
                            Sdílejte trasu se svými přáteli a plánujte společně.
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
                    className="route-users-editor-backdrop"
                    onClick={() => setIsCrewOpen(false)}
                />
            )}

            {/* RIGHT PANEL (Desktop) / BOTTOM SHEET (Mobile) */}
            <div
                className={`route-users-editor-right-panel ${isCrewOpen ? 'route-users-editor-right-panel-open' : 'route-users-editor-right-panel-closed'}`}
            >
                {/* Drag Handle / Header (Mobile Toggle) */}
                <div
                    className="route-users-editor-panel-header group"
                    onClick={() => setIsCrewOpen(!isCrewOpen)}
                >
                    {/* Handle Indicator (Mobile only) */}
                    <div className="route-users-editor-mobile-handle-bar" />

                    <div className="route-users-editor-panel-title-row">
                        <h3 className="route-users-editor-panel-title">
                            <Users size={16} className="route-users-editor-panel-title-icon" />
                            Lidé ({allUsers.length})
                        </h3>

                        {/* Chevron indicator for mobile state */}
                        <ChevronUp
                            size={20}
                            className={`route-users-editor-chevron ${isCrewOpen ? 'route-users-editor-chevron-open' : ''}`}
                        />
                    </div>
                </div>

                <div className="route-users-editor-list-container">
                    <UserList
                        users={allUsers}
                        currentUserId={currentUser?.id || 0}
                        ownerId={route.user?.id || 0}
                        onRemove={(id) => setUserToRemove(id)}
                        isRemovingId={isRemovingId}
                    />
                </div>
            </div>

            {error && <Toast message={error} onClose={clearError} />}

            <ConfirmDialog
                isOpen={userToRemove !== null}
                title="Odebrat uživatele"
                description="Opravdu chcete tohoto uživatele odebrat z trasy?"
                confirmLabel="Odebrat"
                cancelLabel="Zrušit"
                onConfirm={async () => {
                    if (userToRemove !== null) {
                        await removeUser(userToRemove);
                        setUserToRemove(null);
                    }
                }}
                onCancel={() => setUserToRemove(null)}
                isDestructive={true}
                isLoading={isRemovingId !== null}
            />
        </div>
    );
};

export default RouteUsersEditor;
