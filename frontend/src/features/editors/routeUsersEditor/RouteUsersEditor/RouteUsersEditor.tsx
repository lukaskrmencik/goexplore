import { useState } from "react";
import { useRouteUsers } from ".././hooks/useRouteUsers";
import InviteBox from ".././components/InviteBox/InviteBox";
import Toast from "../../../../components/ui/Toast/Toast";
import ConfirmDialog from "../../../../components/ui/ConfirmDialog/ConfirmDialog";
import UserList from ".././components/UserList/UserList";
import type { RouteEditorProps } from "../../../../types/editor";
import { Users, ChevronUp } from "lucide-react";
import "./RouteUsersEditor.css";

const RouteUsersEditor: React.FC<RouteEditorProps> = ({ route, onUpdate }) => {
    const {
        inviteLink,
        isGenerating,
        allUsers,
        currentUserId,
        ownerId,
        removeUser,
        isRemovingId,
        error,
        clearError
    } = useRouteUsers(route, onUpdate);

    const [isCrewPanelOpen, setIsCrewPanelOpen] = useState(false);
    const [userIdPendingRemoval, setUserIdPendingRemoval] = useState<number | null>(null);

    return (
        <div className="route-users-editor-container">

            <div className="route-users-editor-left-panel">
                <div className="route-users-editor-content-wrapper">

                    <div className="route-users-editor-header">
                        <h2 className="route-users-editor-title">Sdílení trasy</h2>
                        <p className="route-users-editor-subtitle">
                            Pozvěte přátele do vaší trasy zasláním odkazu.
                        </p>
                    </div>

                    <InviteBox
                        link={inviteLink}
                        isGenerating={isGenerating}
                    />

                </div>
            </div>

            {isCrewPanelOpen && (
                <div
                    className="route-users-editor-backdrop"
                    onClick={() => setIsCrewPanelOpen(false)}
                />
            )}

            <div className={`route-users-editor-right-panel ${isCrewPanelOpen ? 'route-users-editor-right-panel-open' : 'route-users-editor-right-panel-closed'}`}>
                <div
                    className="route-users-editor-panel-header"
                    onClick={() => setIsCrewPanelOpen(!isCrewPanelOpen)}
                >
                    <div className="route-users-editor-mobile-handle-bar" />

                    <div className="route-users-editor-panel-title-row">
                        <h3 className="route-users-editor-panel-title">
                            <Users size={16} className="route-users-editor-panel-title-icon" />
                            Lidé ({allUsers.length})
                        </h3>

                        <ChevronUp
                            size={20}
                            className={`route-users-editor-chevron ${isCrewPanelOpen ? 'route-users-editor-chevron-open' : ''}`}
                        />
                    </div>
                </div>

                <div className="route-users-editor-list-container">
                    <UserList
                        users={allUsers}
                        currentUserId={currentUserId}
                        ownerId={ownerId}
                        onRemove={(id) => setUserIdPendingRemoval(id)}
                        isRemovingId={isRemovingId}
                    />
                </div>
            </div>

            {error && <Toast message={error} onClose={clearError} />}

            <ConfirmDialog
                isOpen={userIdPendingRemoval !== null}
                title="Odebrat uživatele"
                description="Opravdu chcete tohoto uživatele odebrat z trasy?"
                confirmLabel="Odebrat"
                cancelLabel="Zrušit"
                onConfirm={async () => {
                    if (userIdPendingRemoval !== null) {
                        await removeUser(userIdPendingRemoval);
                        setUserIdPendingRemoval(null);
                    }
                }}
                onCancel={() => setUserIdPendingRemoval(null)}
                isDestructive={true}
                isLoading={isRemovingId !== null}
            />
        </div>
    );
};

export default RouteUsersEditor;
