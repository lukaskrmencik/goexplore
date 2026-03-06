import React, { useState, useEffect } from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';
import { renderToString } from 'react-dom/server';
import type { RouteUser, User } from '../../../../../types/users';
import { geojsonPointToLatLng } from '../../../../../utils/geo';
import { formatDistanceToNowStrict } from 'date-fns';
import { cs } from 'date-fns/locale';
import UserAvatar from '../../../../../components/ui/UserAvatar/UserAvatar';
import './UserMarker.css';

const USER_MARKER_UPDATE_INTERVAL_MS = Number(import.meta.env.VITE_USER_MARKER_UPDATE_INTERVAL ?? "10000");
const USER_MARKER_MAX_AGE_DAYS = Number(import.meta.env.VITE_USER_MARKER_MAX_AGE_DAYS ?? "7");

interface UserMarkerProps {
    user: User | RouteUser;
}

const UserMarker: React.FC<UserMarkerProps> = ({ user }) => {
    const [timeAgo, setTimeAgo] = useState<string>('');

    useEffect(() => {
        if (!user.updated_at) return;

        const updatedAt = new Date(user.updated_at);

        const updateTimeLabel = () => {
            const diffMs = new Date().getTime() - updatedAt.getTime();
            if (diffMs < 30000) {
                setTimeAgo("Právě teď");
            } else {
                setTimeAgo(formatDistanceToNowStrict(updatedAt, { addSuffix: true, locale: cs }));
            }
        };

        updateTimeLabel();
        const intervalId = setInterval(updateTimeLabel, USER_MARKER_UPDATE_INTERVAL_MS);
        return () => clearInterval(intervalId);
    }, [user.updated_at]);

    if (!user.location?.coordinates) return null;

    const updatedAt = user.updated_at ? new Date(user.updated_at) : null;
    if (!updatedAt) return null;

    const maxAgeDate = new Date();
    maxAgeDate.setDate(maxAgeDate.getDate() - USER_MARKER_MAX_AGE_DAYS);
    if (updatedAt < maxAgeDate) return null;

    const position = geojsonPointToLatLng(user.location!);

    {/* --- START: AI-GENERATED UI (Claude 3.7 Sonnet Thinking) --- */}
    {/* Layout and structure generated from design. Data binding and variables added manually. */}

    const avatarHtml = renderToString(
        <div className="user-marker-avatar-wrapper">
            <UserAvatar
                name={user.name}
                profilePicture={user.profile_picture}
                className="user-marker-avatar-img"
                showBorder={true}
            />
            <div className="user-marker-badge">
                <span className="user-marker-name">{user.name}</span>
                <span className="user-marker-time">{timeAgo}</span>
            </div>
        </div>
    );

    {/* --- END: AI-GENERATED UI --- */}

    const icon = L.divIcon({
        html: `<div className="user-marker-container">${avatarHtml}</div>`,
        className: 'custom-user-marker',
        iconSize: [48, 48],
        iconAnchor: [24, 48],
    });

    return <Marker position={position} icon={icon} />;
};

export default UserMarker;
