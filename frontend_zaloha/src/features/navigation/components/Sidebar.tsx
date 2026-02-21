import { useNavigationLogic } from "../hooks/useNavigationLogic";
import { getNavItems } from "./NavigationItems";
import { LogOut } from "lucide-react";

const Sidebar = () => {
    const { activeRouteId, navigateTo, isActivePath } = useNavigationLogic();
    const items = getNavItems(activeRouteId);

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/login"; // Nebo tvůj auth redirect
    };

    return (
        <aside className="hidden h-screen w-64 flex-col border-r bg-white shadow-sm md:flex fixed left-0 top-0">
            <div className="flex h-16 items-center justify-center border-b px-6">
                <h1 className="text-xl font-bold text-blue-600">RoadTrip App</h1>
            </div>

            <nav className="flex-1 space-y-2 p-4">
                {items.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => !item.disabled && navigateTo(item.path)}
                        disabled={item.disabled}
                        className={`group flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all
                            ${item.disabled ? 'cursor-not-allowed opacity-40 grayscale' : 'cursor-pointer'}
                            ${isActivePath(item.path) && !item.disabled
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                            ${item.special && !item.disabled ? 'ring-1 ring-blue-200 bg-blue-50/50' : ''}
                        `}
                    >
                        <item.icon className={`h-5 w-5 ${item.special && !item.disabled ? 'text-blue-500 fill-blue-500/20' : ''}`} />
                        {item.label}
                        {item.special && activeRouteId && (
                            <span className="ml-auto block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        )}
                    </button>
                ))}
            </nav>

            <div className="border-t p-4">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                    <LogOut className="h-5 w-5" />
                    Odhlásit se
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
