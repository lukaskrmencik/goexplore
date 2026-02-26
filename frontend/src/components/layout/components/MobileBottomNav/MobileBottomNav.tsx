import React from 'react';
import './MobileBottomNav.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { Map, Package, Plus, User as UserIcon, LogOut } from 'lucide-react';

interface MobileBottomNavProps {
    onLogout: () => void;
}

const MOBILE_NAV_ITEMS = [
    { icon: Map, label: 'Moje cesty', path: '/', isCenter: false, isLogout: false },
    { icon: Package, label: 'Vybavení', path: '/equipment', isCenter: false, isLogout: false },
    { icon: Plus, label: 'Nová cesta', path: '/routes/new', isCenter: true, isLogout: false },
    { icon: UserIcon, label: 'Účet', path: '/account', isCenter: false, isLogout: false },
    { icon: LogOut, label: 'Odhlásit', path: '', isCenter: false, isLogout: true },
];

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="mobile-bottom-nav">
            <div className="mobile-bottom-nav-grid">
                {MOBILE_NAV_ITEMS.map((item) => {
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
                            <button key="logout" onClick={onLogout} className="mobile-nav-item">
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
    );
};

export default MobileBottomNav;
