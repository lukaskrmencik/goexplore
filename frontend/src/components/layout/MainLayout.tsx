import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Map, Package, Plus, Sliders, User, PlusCircle } from 'lucide-react';
import UserAvatar from '../../components/ui/UserAvatar';

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
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">

            {/* MOBILE TOP HEADER (FIXED) */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-slate-200 h-14 px-6 flex items-center justify-center z-[5000]">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-emerald-600/10">
                        GO
                    </div>
                    <span className="font-heading font-bold text-lg text-slate-900 tracking-tight">GoExplore</span>
                </div>
            </div>

            {/* DESKTOP HEADER (STICKY) */}
            <div className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-[5000] justify-center">
                {/* Max Width Container for Header Content */}
                <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-full">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-emerald-600/10">
                            GO
                        </div>
                        <span className="font-heading font-bold text-xl text-slate-900 tracking-tight">GoExplore</span>
                    </div>

                    <div className="flex items-center gap-8">
                        {desktopNavItems.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => !item.disabled && navigate(item.path)}
                                disabled={item.disabled}
                                className={`flex items-center gap-2 font-medium transition-colors ${location.pathname === item.path
                                    ? 'text-emerald-600 font-bold'
                                    : 'text-slate-500 hover:text-slate-900'
                                    } ${item.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                            >
                                <item.icon size={18} />
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/routes/new')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-bold text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"
                        >
                            <PlusCircle size={16} />
                            Nová cesta
                        </button>

                        <div className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/account')}>
                            <UserAvatar name={userMock.name} profilePicture={userMock.profile_picture} />
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 w-full pt-14 md:pt-16 pb-20 md:pb-0 px-0 md:px-0">
                {children}
            </main>

            {/* MOBILE BOTTOM NAVIGATION (FIXED) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 h-[60px] bg-white border-t border-slate-200 z-[5000] pb-safe">
                <div className="grid grid-cols-5 items-end justify-items-center h-full w-full">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;

                        if (item.isCenter) {
                            return (
                                <div key={item.path} className="relative -top-5">
                                    <button
                                        onClick={() => navigate(item.path)}
                                        className="w-14 h-14 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 active:scale-95 transition-transform"
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
                                className={`flex flex-col items-center gap-1 w-full py-1 ${item.disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                            >
                                <div className={`transition-colors ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    <item.icon size={isActive ? 24 : 22} strokeWidth={isActive ? 2.5 : 2} />
                                </div>
                                <span className={`text-[10px] font-bold ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
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
