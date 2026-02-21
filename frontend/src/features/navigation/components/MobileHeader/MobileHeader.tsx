import { LogOut } from "lucide-react";
import "./MobileHeader.css";

const MobileHeader = () => {
    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/login";
    };

    return (
        <header className="mobile-header-container">
            <h1 className="mobile-header-title">RoadTrip App</h1>
            <button
                onClick={handleLogout}
                className="mobile-header-logout-btn"
                title="Odhlásit se"
            >
                <LogOut className="mobile-header-logout-icon" />
            </button>
        </header>
    );
};

export default MobileHeader;
