import { useNavigationLogic } from "../../hooks/useNavigationLogic";
import { getNavItems } from ".././NavigationItems/NavigationItems";
import { LogOut } from "lucide-react";
import "./Sidebar.css";

const Sidebar = () => {
    const { activeRouteId, navigateTo, isActivePath } = useNavigationLogic();
    const items = getNavItems(activeRouteId);

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/login"; // Nebo tvůj auth redirect
    };

    return (
        <aside className="sidebar-container">
            <div className="sidebar-header">
                <h1 className="sidebar-title">RoadTrip App</h1>
            </div>

            <nav className="sidebar-nav">
                {items.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => !item.disabled && navigateTo(item.path)}
                        disabled={item.disabled}
                        className={`sidebar-nav-item
                            ${item.disabled ? 'sidebar-nav-item-disabled' : 'sidebar-nav-item-enabled'}
                            ${isActivePath(item.path) && !item.disabled
                                ? 'sidebar-nav-item-active'
                                : 'sidebar-nav-item-inactive'}
                            ${item.special && !item.disabled ? 'sidebar-nav-item-special' : ''}
                        `}
                    >
                        <item.icon className={`sidebar-nav-icon ${item.special && !item.disabled ? 'sidebar-nav-icon-special' : ''}`} />
                        {item.label}
                        {item.special && activeRouteId && (
                            <span className="sidebar-nav-indicator" />
                        )}
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button
                    onClick={handleLogout}
                    className="sidebar-logout-btn"
                >
                    <LogOut className="sidebar-nav-icon" />
                    Odhlásit se
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
