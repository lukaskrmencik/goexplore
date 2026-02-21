import { LogOut } from "lucide-react";

const MobileHeader = () => {
    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/login";
    };

    return (
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-white px-4 shadow-sm md:hidden">
            <h1 className="text-lg font-bold text-blue-600">RoadTrip App</h1>
            <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-600"
                title="Odhlásit se"
            >
                <LogOut className="h-5 w-5" />
            </button>
        </header>
    );
};

export default MobileHeader;
