import type { RouteUser } from "../../../../../types/users";
import { Trash2, Crown } from "lucide-react";
import UserAvatar from "../../../../../components/ui/UserAvatar/UserAvatar";
import "./UserList.css";

interface UserListProps {
    users: RouteUser[];
    currentUserId: number;
    ownerId: number;
    onRemove: (id: number) => void;
    isRemovingId: number | null;
}

const UserList: React.FC<UserListProps> = ({ users, currentUserId, ownerId, onRemove, isRemovingId }) => {

    {/* --- START: AI-GENERATED UI (Claude 3.7 Sonnet Thinking) --- */}
    {/* Layout and structure generated from design. Data binding and variables added manually. */}

    return (
        <div className="user-list-container">
            {users.map((user) => {
                const isCurrentUser = user.id === currentUserId;
                const isOwner = user.id === ownerId;

                return (
                    <div
                        key={user.id}
                        className={`user-list-item ${isCurrentUser ? 'user-list-item-me' : 'user-list-item-other'}`}
                    >
                        <div className="user-list-info-container">
                            <div className="user-list-avatar">
                                <UserAvatar
                                    name={user.name}
                                    profilePicture={user.profile_picture}
                                    size="lg"
                                />

                                {isOwner && (
                                    <div className="user-list-crown-badge">
                                        <Crown size={10} fill="currentColor" />
                                    </div>
                                )}
                            </div>

                            <div>
                                <p className={isCurrentUser ? 'user-list-name-me' : 'user-list-name-other'}>
                                    {user.name}
                                </p>
                                <p className="user-list-role">
                                    {isOwner ? "Organizátor trasy" : "Člen posádky"}
                                </p>
                            </div>
                        </div>

                        {!isCurrentUser && !isOwner && (
                            <button
                                onClick={() => onRemove(user.id)}
                                disabled={isRemovingId === user.id}
                                className="user-list-remove-btn"
                                title="Odebrat z posádky"
                            >
                                {isRemovingId === user.id ? (
                                    <div className="user-list-remove-spinner" />
                                ) : (
                                    <Trash2 size={18} />
                                )}
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );

    {/* --- END: AI-GENERATED UI --- */}
};

export default UserList;
