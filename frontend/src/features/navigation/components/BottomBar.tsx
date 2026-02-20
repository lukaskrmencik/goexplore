import { useNavigationLogic } from "../hooks/useNavigationLogic";
import { getNavItems } from "./NavigationItems";

const BottomBar = () => {
    const { activeRouteId, navigateTo, isActivePath } = useNavigationLogic();
    const items = getNavItems(activeRouteId);

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-white px-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:hidden">
            {items.map((item) => (
                <button
                    key={item.id}
                    onClick={() => !item.disabled && navigateTo(item.path)}
                    disabled={item.disabled}
                    className={`flex flex-1 flex-col items-center justify-center gap-1 py-1
                        ${item.disabled ? 'cursor-not-allowed opacity-30' : ''}
                        ${isActivePath(item.path) && !item.disabled ? 'text-blue-600' : 'text-gray-500'}
                    `}
                >
                    <div className={`relative rounded-full p-1 ${item.special && !item.disabled ? 'bg-blue-50' : ''}`}>
                        <item.icon className={`h-6 w-6 ${isActivePath(item.path) ? 'stroke-[2.5px]' : ''}`} />
                        {item.special && activeRouteId && (
                            <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
                        )}
                    </div>
                    <span className="text-[10px] font-medium">{item.label}</span>
                </button>
            ))}
        </div>
    );
};

export default BottomBar;
