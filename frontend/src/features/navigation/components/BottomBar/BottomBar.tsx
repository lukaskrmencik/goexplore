import { useNavigationLogic } from "../../hooks/useNavigationLogic";
import { getNavItems } from ".././NavigationItems/NavigationItems";
import "./BottomBar.css";

const BottomBar = () => {
    const { activeRouteId, navigateTo, isActivePath } = useNavigationLogic();
    const items = getNavItems(activeRouteId);

    return (
        <div className="bottom-bar-container">
            {items.map((item) => (
                <button
                    key={item.id}
                    onClick={() => !item.disabled && navigateTo(item.path)}
                    disabled={item.disabled}
                    className={`bottom-bar-nav-item
                        ${item.disabled ? 'bottom-bar-nav-item-disabled' : ''}
                        ${isActivePath(item.path) && !item.disabled ? 'bottom-bar-nav-item-active' : 'bottom-bar-nav-item-inactive'}
                    `}
                >
                    <div className={`bottom-bar-icon-wrapper ${item.special && !item.disabled ? 'bottom-bar-icon-wrapper-special' : ''}`}>
                        <item.icon className={`bottom-bar-icon ${isActivePath(item.path) ? 'bottom-bar-icon-active' : ''}`} />
                        {item.special && activeRouteId && (
                            <span className="bottom-bar-indicator" />
                        )}
                    </div>
                    <span className="bottom-bar-label">{item.label}</span>
                </button>
            ))}
        </div>
    );
};

export default BottomBar;
