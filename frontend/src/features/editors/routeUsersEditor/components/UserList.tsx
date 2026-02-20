
import type { RouteUser } from "../../../../types/users";
import { User, Shield, Trash2, Crown } from "lucide-react";

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
        <div className="space-y-3">
            {users.map((user) => {
                const isMe = user.id === currentUserId;
                const isCreator = true; // TODO: Add creator check if available in types

                return (
                    <div
                        key={user.id}
                        className={`
                            group flex items-center justify-between p-4 rounded-2xl border transition-all shadow-sm
                            ${isMe
                                ? 'bg-emerald-50/50 border-emerald-100'
                                : 'bg-white border-slate-100 hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-500/5'
                            }
                        `}
                    >
                        <div className="flex items-center gap-4">
                            {/* Avatar */}
                            <div className={`
                                relative flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold shadow-sm
                                ${isMe
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-indigo-50 text-indigo-600'
                                }
                            `}>
                                {user.profile_picture ? (
                                    <img src={user.profile_picture} alt={user.name} className="h-full w-full object-cover rounded-xl" />
                                ) : (
                                    <span>{getInitials(user.name)}</span>
                                )}

                                {isMe && (
                                    <div className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-white shadow-sm">
                                        <Crown size={10} fill="currentColor" />
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div>
                                <p className={`font-bold ${isMe ? 'text-emerald-900' : 'text-slate-800'}`}>
                                    {user.name}
                                    {isMe && <span className="ml-2 text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full inline-block">Já</span>}
                                </p>
                                <p className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mt-0.5">
                                    {isMe ? <Shield size={12} className="text-emerald-500" /> : <User size={12} />}
                                    {isMe ? "Organizátor trasy" : "Člen posádky"}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        {!isMe && (
                            <button
                                onClick={() => onRemove(user.id)}
                                disabled={isRemovingId === user.id}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Odebrat z posádky"
                            >
                                {isRemovingId === user.id ? (
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
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
