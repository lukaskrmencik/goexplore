import React from "react";
import { User as UserIcon } from "lucide-react";

interface UserAvatarProps {
    name?: string;
    profilePicture?: string | null;
    size?: "sm" | "md" | "lg";
    className?: string;
    showBorder?: boolean;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
    name,
    profilePicture,
    size = "md",
    className = "",
    showBorder = false
}) => {
    const getSizeClasses = () => {
        switch (size) {
            case "sm": return "w-6 h-6 text-xs";
            case "lg": return "w-12 h-12 text-lg";
            case "md": default: return "w-8 h-8 text-sm";
        }
    };

    const getInitials = (userName?: string) => {
        if (!userName) return "?";
        const parts = userName.trim().split(" ");
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const borderClass = showBorder ? "ring-2 ring-white" : "";

    if (profilePicture) {
        return (
            <img
                src={profilePicture}
                alt={name || "User"}
                className={`rounded-full object-cover ${getSizeClasses()} ${borderClass} ${className}`}
            />
        );
    }

    // Deterministic pastel color based on name length/char
    const colors = [
        "bg-red-100 text-red-600",
        "bg-orange-100 text-orange-600",
        "bg-amber-100 text-amber-600",
        "bg-emerald-100 text-emerald-600",
        "bg-teal-100 text-teal-600",
        "bg-cyan-100 text-cyan-600",
        "bg-blue-100 text-blue-600",
        "bg-indigo-100 text-indigo-600",
        "bg-violet-100 text-violet-600",
        "bg-purple-100 text-purple-600",
        "bg-fuchsia-100 text-fuchsia-600",
        "bg-pink-100 text-pink-600",
        "bg-rose-100 text-rose-600",
    ];

    const colorIndex = name ? name.length % colors.length : 0;
    const colorClass = colors[colorIndex];

    return (
        <div className={`rounded-full flex items-center justify-center font-bold ${colorClass} ${getSizeClasses()} ${borderClass} ${className}`}>
            {name ? getInitials(name) : <UserIcon size={12} />}
        </div>
    );
};

export default UserAvatar;
