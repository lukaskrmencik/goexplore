import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Map, Package, Plus, Sliders, User, PlusCircle } from 'lucide-react';
import UserAvatar from '../../../components/ui/UserAvatar/UserAvatar';
import './MainLayout.css';

interface MainLayoutProps {
    children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Simulate user data - in real app would come from AuthContext
    // TODO: Connect to actual user context
    const userMock = {
        name: "Lukas Krmencik",
        profile_picture: null
    };

    const navItems = [
        { icon: Map, label: 'Moje cesty', path: '/' },
        { icon: Package, label: 'Vybavení', path: '/equipment' },
        { icon: Plus, label: 'Nová cesta', path: '/routes/new', isCenter: true },
        { icon: Sliders, label: 'Nastavení', path: '/preferences', disabled: true },
        { icon: User, label: 'Účet', path: '/account' },
    ];

    // Filter out "New Trip" (Center button) for Desktop Top Bar as it's separate
    const desktopNavItems = navItems.filter(item => !item.isCenter);

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
                                onClick={() => !item.disabled && navigate(item.path)}
                                disabled={item.disabled}
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
                            <UserAvatar name={userMock.name} profilePicture={userMock.profile_picture} />
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <main className="main-content">
                {children}
            </main>

            {/* MOBILE BOTTOM NAVIGATION (FIXED) */}
            <div className="mobile-bottom-nav">
                <div className="mobile-bottom-nav-grid">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;

                        if (item.isCenter) {
                            return (
                                <div key={item.path} className="mobile-nav-center-wrapper">
                                    <button
                                        onClick={() => navigate(item.path)}
                                        className="mobile-nav-center-btn"
                                    >
                                        <Plus size={24} />
                                    </button>
                                </div>
                            );
                        }

                        return (
                            <button
                                key={item.path}
                                disabled={item.disabled}
                                onClick={() => !item.disabled && navigate(item.path)}
                                className={`mobile-nav-item`}
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
