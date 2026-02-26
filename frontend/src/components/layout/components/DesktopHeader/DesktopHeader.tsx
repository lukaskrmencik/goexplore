import React from 'react';
import './DesktopHeader.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { Map, Package, User as UserIcon, PlusCircle } from 'lucide-react';
import UserAvatar from '../../../ui/UserAvatar/UserAvatar';
import type { User } from '../../../../types/users';

interface DesktopHeaderProps {
    currentUser: User | null;
}

const DESKTOP_NAV_ITEMS = [
    { icon: Map, label: 'Moje cesty', path: '/' },
    { icon: Package, label: 'Vybavení', path: '/equipment' },
    { icon: UserIcon, label: 'Účet', path: '/account' },
];

const DesktopHeader: React.FC<DesktopHeaderProps> = ({ currentUser }) => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="desktop-header">
            <div className="desktop-header-content">
                <div className="logo-container" onClick={() => navigate('/')}>
                    <img src="/goexplore_logo.svg" alt="GoExplore logo" className="desktop-logo-icon" />
                    <span className="desktop-logo-text">GoExplore</span>
                </div>

                <div className="desktop-nav-items">
                    {DESKTOP_NAV_ITEMS.map((item) => (
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
                    <button onClick={() => navigate('/routes/new')} className="new-route-btn">
                        <PlusCircle size={16} />
                        Nová cesta
                    </button>

                    <div className="user-avatar-wrapper" onClick={() => navigate('/account')}>
                        <UserAvatar
                            name={currentUser?.name || "User"}
                            profilePicture={currentUser?.profile_picture}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DesktopHeader;
