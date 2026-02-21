
import type { RouteUser } from "../../../../../types/users";
import { User, Shield, Trash2, Crown } from "lucide-react";
import "./UserList.css";

interface UserListProps {
    users: RouteUser[];
    currentUserId: number; // Abychom neodebrali sami sebe
    onRemove: (id: number) => void;
    isRemovingId: number | null;
}

const UserList: React.FC<UserListProps> = ({ users, currentUserId, onRemove, isRemovingId }) => {

    // Helper pro iniciály, pokud není fotka
    const getInitials = (name: string) => {
        return name.slice(0, 2).toUpperCase();
    };

    return (
        <div className="user-list-container">
            {users.map((user) => {
                const isMe = user.id === currentUserId;

                return (
                    <div
                        key={user.id}
                        className={`user-list-item ${isMe ? 'user-list-item-me' : 'user-list-item-other'}`}
                    >
                        <div className="user-list-info-container">
                            {/* Avatar */}
                            <div className={`user-list-avatar ${isMe ? 'user-list-avatar-me' : 'user-list-avatar-other'}`}>
                                {user.profile_picture ? (
                                    <img src={user.profile_picture} alt={user.name} className="user-list-avatar-image" />
                                ) : (
                                    <span>{getInitials(user.name)}</span>
                                )}

                                {isMe && (
                                    <div className="user-list-crown-badge">
                                        <Crown size={10} fill="currentColor" />
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div>
                                <p className={isMe ? 'user-list-name-me' : 'user-list-name-other'}>
                                    {user.name}
                                    {isMe && <span className="user-list-me-badge">Já</span>}
                                </p>
                                <p className="user-list-role">
                                    {isMe ? <Shield size={12} className="user-list-role-icon-me" /> : <User size={12} />}
                                    {isMe ? "Organizátor trasy" : "Člen posádky"}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        {!isMe && (
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
