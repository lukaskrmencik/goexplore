import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocationTracker } from '../../../hooks/useLocationTracker';
import { useMainLayoutUser } from '../hooks/useMainLayoutUser';
import { logout } from '../../../services/authApiService';
import { AUTH_TOKEN_KEY } from '../../../utils/auth';
import DesktopHeader from '../components/DesktopHeader/DesktopHeader';
import MobileTopHeader from '../components/MobileTopHeader/MobileTopHeader';
import MobileBottomNav from '../components/MobileBottomNav/MobileBottomNav';
import LocationPermissionBanner from '../components/LocationPermissionBanner/LocationPermissionBanner';
import './MainLayout.css';

interface MainLayoutProps {
    children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const { currentUser } = useMainLayoutUser();
    const { permissionState, requestPermission } = useLocationTracker(true);

    const handleLogout = async () => {
        try {
            await logout();
        } catch {
            localStorage.removeItem(AUTH_TOKEN_KEY);
        }
        navigate('/login');
    };

    {/* --- START: AI-GENERATED UI (Claude 3.7 Sonnet Thinking) --- */}
    {/* Layout and structure generated from design. Data binding and variables added manually. */}

    return (
        <div className="layout-container">
            <MobileTopHeader />
            <DesktopHeader currentUser={currentUser} />

            <main className="main-content">
                {permissionState === 'prompt' && (
                    <LocationPermissionBanner onRequestPermission={requestPermission} />
                )}
                {children}
            </main>

            <MobileBottomNav onLogout={handleLogout} />
        </div>
    );

    {/* --- END: AI-GENERATED UI --- */}
};
