import { useState, useEffect } from "react";
import { useRouteUsers } from ".././hooks/useRouteUsers";
import InviteBox from ".././components/InviteBox/InviteBox";
import Toast from "../../../../components/ui/Toast/Toast";
import UserList from ".././components/UserList/UserList";
import type { RouteEditorProps } from "../../../../types/editor";
import { Users, ChevronUp } from "lucide-react";
import { fetchMyUser } from "../../../../services/usersApiService";
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
        <div className="route-users-editor-container">

            {/* LEFT PANEL: Invite Action */}
            {/* Added extra bottom padding on mobile so content isn't covered by the collapsed sheet */}
            <div className="route-users-editor-left-panel">
                <div className="route-users-editor-content-wrapper">

                    {/* Header */}
                    <div className="route-users-editor-header">
                        <h2 className="route-users-editor-title">
                            Kdo jede s námi?
                        </h2>
                        <p className="route-users-editor-subtitle">
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
                            Posádka ({allUsers.length})
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
