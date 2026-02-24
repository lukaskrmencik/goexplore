
import type { RouteUser } from "../../../../../types/users";
import { Trash2, Crown } from "lucide-react";
import UserAvatar from "../../../../../components/ui/UserAvatar/UserAvatar";
import "./UserList.css";

interface UserListProps {
    users: RouteUser[];
    currentUserId: number; // Abychom neodebrali sami sebe
    ownerId: number;       // Abychom poznali organizátora
    onRemove: (id: number) => void;
    isRemovingId: number | null;
}

const UserList: React.FC<UserListProps> = ({ users, currentUserId, ownerId, onRemove, isRemovingId }) => {
    return (
        <div className="user-list-container">
            {users.map((user) => {
                const isMe = user.id === currentUserId;
                const isOwner = user.id === ownerId;

                return (
                    <div
                        key={user.id}
                        className={`user-list-item ${isMe ? 'user-list-item-me' : 'user-list-item-other'}`}
                    >
                        <div className="user-list-info-container">
                            {/* Avatar */}
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

                            {/* Info */}
                            <div>
                                <p className={isMe ? 'user-list-name-me' : 'user-list-name-other'}>
                                    {user.name}
                                </p>
                                <p className="user-list-role">
                                    {isOwner ? "Organizátor trasy" : "Člen posádky"}
                                </p>
                            </div>
                        </div>

                        {/* Actions (Only the owner logic or "not me" logic needs handling, keep "not me" for remove for now) */}
                        {!isMe && !isOwner && (
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
};

export default UserList;
