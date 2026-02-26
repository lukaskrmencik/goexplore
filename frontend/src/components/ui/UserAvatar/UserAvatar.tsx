import React from "react";
import { User as UserIcon } from "lucide-react";
import { getImageUrl } from "../../../utils/imageUrl";
import './UserAvatar.css';

interface UserAvatarProps {
    name?: string;
    profilePicture?: string | null;
    size?: "sm" | "md" | "lg";
    className?: string;
    showBorder?: boolean;
}

const AVATAR_COLOR_COUNT = 13;

function resolveAvatarSizeClass(size: "sm" | "md" | "lg"): string {
    switch (size) {
        case "sm": return "avatar-sm";
        case "lg": return "avatar-lg";
        default: return "avatar-md";
    }
}

function resolveUserInitials(userName?: string): string {
    if (!userName) return "?";
    const parts = userName.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const UserAvatar: React.FC<UserAvatarProps> = ({
    name,
    profilePicture,
    size = "md",
    className = "",
    showBorder = false,
}) => {
    const sizeClass = resolveAvatarSizeClass(size);
    const borderClass = showBorder ? "avatar-border" : "";
    const imageUrl = getImageUrl(profilePicture);

    if (imageUrl) {
        return (
            <img
                src={imageUrl}
                alt={name || "User"}
                className={`avatar avatar-image ${sizeClass} ${borderClass} ${className}`}
            />
        );
    }

    const colorIndex = name ? name.length % AVATAR_COLOR_COUNT : 0;

    return (
        <div className={`avatar avatar-color-${colorIndex} ${sizeClass} ${borderClass} ${className}`}>
            {name ? resolveUserInitials(name) : <UserIcon size={12} />}
        </div>
    );
};

export default UserAvatar;
