import React from "react";
import { User as UserIcon } from "lucide-react";
import './UserAvatar.css';

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
            case "sm": return "avatar-sm";
            case "lg": return "avatar-lg";
            case "md": default: return "avatar-md";
        }
    };

    const getInitials = (userName?: string) => {
        if (!userName) return "?";
        const parts = userName.trim().split(" ");
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const borderClass = showBorder ? "avatar-border" : "";

    if (profilePicture) {
        return (
            <img
                src={profilePicture}
                alt={name || "User"}
                className={`avatar avatar-image ${getSizeClasses()} ${borderClass} ${className}`}
            />
        );
    }

    const numColors = 13;
    const colorIndex = name ? name.length % numColors : 0;
    const colorClass = `avatar-color-${colorIndex}`;

    return (
        <div className={`avatar ${colorClass} ${getSizeClasses()} ${borderClass} ${className}`}>
            {name ? getInitials(name) : <UserIcon size={12} />}
        </div>
    );
};

export default UserAvatar;
