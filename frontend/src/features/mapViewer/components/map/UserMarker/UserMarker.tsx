import React, { useState, useEffect } from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';
import { renderToString } from 'react-dom/server';
import type { RouteUser, User } from '../../../../../types/users';
import { geojsonPointToLatLng } from '../../../../../utils/geo';
import { formatDistanceToNowStrict } from 'date-fns';
import { cs } from 'date-fns/locale';
import './UserMarker.css';

// We import the UserAvatar but we have to render it to HTML string for Leaflet DivIcon
import UserAvatar from '../../../../../components/ui/UserAvatar/UserAvatar';

interface UserMarkerProps {
    user: User | RouteUser;
}

const UserMarker: React.FC<UserMarkerProps> = ({ user }) => {
    const [timeAgo, setTimeAgo] = useState<string>('');

    useEffect(() => {
        if (!user.updated_at) return;
        const updatedAt = new Date(user.updated_at);

        const updateTime = () => {
            const now = new Date();
            const diffMs = now.getTime() - updatedAt.getTime();

            if (diffMs < 30000) {
                setTimeAgo("Právě teď");
            } else {
                setTimeAgo(formatDistanceToNowStrict(updatedAt, {
                    addSuffix: true,
                    locale: cs,
                }));
            }
        };

        const USER_MARKER_UPDATE_INTERVAL = Number(import.meta.env.VITE_USER_MARKER_UPDATE_INTERVAL ?? "10000");

        updateTime();
        const intervalId = setInterval(updateTime, USER_MARKER_UPDATE_INTERVAL);

        return () => clearInterval(intervalId);
    }, [user.updated_at]);

    // Only render if we have a valid location
    if (!user.location || !user.location.coordinates) {
        return null;
    }

    const USER_MARKER_MAX_AGE_DAYS = Number(import.meta.env.VITE_USER_MARKER_MAX_AGE_DAYS ?? "7");

    const updatedAt = user.updated_at ? new Date(user.updated_at) : null;
    if (!updatedAt) return null;

    const maxAgeDate = new Date();
    maxAgeDate.setDate(maxAgeDate.getDate() - USER_MARKER_MAX_AGE_DAYS);

    if (updatedAt < maxAgeDate) {
        return null;
    }

    const position = geojsonPointToLatLng(user.location as any);

    // Create custom HTML for the marker using the global UserAvatar styling
    // Since we need HTML, we render the React component to a string
    const avatarHtml = renderToString(
        <div className="user-marker-avatar-wrapper">
            <UserAvatar
                name={user.name}
                profilePicture={user.profile_picture}
                className="user-marker-avatar-img"
                showBorder={true}
            />
            <div className="user-marker-badge">{timeAgo}</div>
        </div>
    );

    const icon = L.divIcon({
        html: `
            <div className="user-marker-container">
                ${avatarHtml}
            </div>
        `,
        className: 'custom-user-marker',
        iconSize: [48, 48],
        iconAnchor: [24, 48], // Anchor at bottom center
    });

    return (
        <Marker position={position} icon={icon} />
    );
};

export default UserMarker;
