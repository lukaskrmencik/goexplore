import React from 'react';
import './LocationPermissionBanner.css';
import { MapPin } from 'lucide-react';

interface LocationPermissionBannerProps {
    onRequestPermission: () => void;
}

const LocationPermissionBanner: React.FC<LocationPermissionBannerProps> = ({ onRequestPermission }) => {

    {/* --- START: AI-GENERATED UI (Gemini 3.1 Pro) --- */}
    {/* Layout and structure generated from design. Data binding and variables added manually. */}
    return (
        <div className="location-permission-banner">
            <div className="location-permission-content">
                <MapPin size={18} className="location-permission-icon" />
                <span>Povolit sdílení polohy s posádkou</span>
            </div>
            <button className="location-permission-btn" onClick={onRequestPermission}>
                Povolit
            </button>
        </div>
    );
    {/* --- END: AI-GENERATED UI --- */}
};

export default LocationPermissionBanner;
