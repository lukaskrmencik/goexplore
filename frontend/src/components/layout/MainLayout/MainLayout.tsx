import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchMyProfile, type UserProfile } from '../../../services/userApiService';
import { Map, Package, Plus, User, PlusCircle, MapPin, LogOut } from 'lucide-react';
import UserAvatar from '../../../components/ui/UserAvatar/UserAvatar';
import { useLocationTracker } from '../../../hooks/useLocationTracker';
import './MainLayout.css';

interface MainLayoutProps {
    children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Enable background location tracking for authenticated users every 30 seconds
    // Note: Since MainLayout is used in ProtectedRoute, we know they are authenticated, so we can just pass `true`.
    const { permissionState, requestPermission } = useLocationTracker(true, 30000);

    const [user, setUser] = useState<UserProfile | null>(null);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const data = await fetchMyProfile();
                setUser(data);
            } catch (error) {
                console.error("Failed to load user for layout:", error);
            }
        };
        loadUser();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const desktopNavItems = [
        { icon: Map, label: 'Moje cesty', path: '/' },
        { icon: Package, label: 'Vybavení', path: '/equipment' },
        { icon: User, label: 'Účet', path: '/account' },
    ];

    const mobileNavItems = [
        { icon: Map, label: 'Moje cesty', path: '/', isCenter: false, isLogout: false },
        { icon: Package, label: 'Vybavení', path: '/equipment', isCenter: false, isLogout: false },
        { icon: Plus, label: 'Nová cesta', path: '/routes/new', isCenter: true, isLogout: false },
        { icon: User, label: 'Účet', path: '/account', isCenter: false, isLogout: false },
        { icon: LogOut, label: 'Odhlásit', path: '', isCenter: false, isLogout: true },
    ];

    return (
        <div className="layout-container">

            {/* MOBILE TOP HEADER (FIXED) */}
            <div className="mobile-header">
                <div className="logo-container" onClick={() => navigate('/')}>
                    <div className="logo-icon">
                        GO
                    </div>
                    <span className="logo-text">GoExplore</span>
                </div>
            </div>

            {/* DESKTOP HEADER (STICKY) */}
            <div className="desktop-header">
                {/* Max Width Container for Header Content */}
                <div className="desktop-header-content">
                    <div className="logo-container" onClick={() => navigate('/')}>
                        <div className="desktop-logo-icon">
                            GO
                        </div>
                        <span className="desktop-logo-text">GoExplore</span>
                    </div>

                    <div className="desktop-nav-items">
                        {desktopNavItems.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`desktop-nav-link ${location.pathname === item.path ? 'active' : 'inactive'}`}
                            >
                                <item.icon size={18} />
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div className="desktop-actions">
                        <button
                            onClick={() => navigate('/routes/new')}
                            className="new-route-btn"
                        >
                            <PlusCircle size={16} />
                            Nová cesta
                        </button>

                        <div className="user-avatar-wrapper" onClick={() => navigate('/account')}>
                            <UserAvatar name={user?.name || "User"} profilePicture={user?.profile_picture} />
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <main className="main-content">
                {permissionState === 'prompt' && (
                    <div className="location-permission-banner">
                        <div className="location-permission-content">
                            <MapPin size={18} className="location-permission-icon" />
                            <span>Povolit sdílení polohy s posádkou</span>
                        </div>
                        <button className="location-permission-btn" onClick={requestPermission}>
                            Povolit
                        </button>
                    </div>
                )}

                {children}
            </main>

            {/* MOBILE BOTTOM NAVIGATION (FIXED) */}
            <div className="mobile-bottom-nav">
                <div className="mobile-bottom-nav-grid">
                    {mobileNavItems.map((item) => {
                        const isActive = !item.isLogout && location.pathname === item.path;

                        if (item.isCenter) {
                            return (
                                <div key="center" className="mobile-nav-center-wrapper">
                                    <button
                                        onClick={() => navigate(item.path)}
                                        className="mobile-nav-center-btn"
                                    >
                                        <Plus size={24} />
                                    </button>
                                </div>
                            );
                        }

                        if (item.isLogout) {
                            return (
                                <button
                                    key="logout"
                                    onClick={handleLogout}
                                    className="mobile-nav-item"
                                >
                                    <div className="mobile-nav-icon-wrapper inactive">
                                        <LogOut size={22} strokeWidth={2} />
                                    </div>
                                    <span className="mobile-nav-text inactive">{item.label}</span>
                                </button>
                            );
                        }

                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className="mobile-nav-item"
                            >
                                <div className={`mobile-nav-icon-wrapper ${isActive ? 'active' : 'inactive'}`}>
                                    <item.icon size={isActive ? 24 : 22} strokeWidth={isActive ? 2.5 : 2} />
                                </div>
                                <span className={`mobile-nav-text ${isActive ? 'active' : 'inactive'}`}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

        </div>
    );
};
