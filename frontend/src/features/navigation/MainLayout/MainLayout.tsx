import Sidebar from ".././components/Sidebar/Sidebar";
import BottomBar from ".././components/BottomBar/BottomBar";
import MobileHeader from ".././components/MobileHeader/MobileHeader";
import "./MainLayout.css";

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <div className="main-layout-container">
            <Sidebar />

            <div className="main-layout-content-wrapper">
                <MobileHeader />

                {/* Main content wrapper - padding bottom for navbar mobile */}
                <main className="main-layout-main">
                    <div className="main-layout-inner">
                        {children}
                    </div>
                </main>
            </div>

            <BottomBar />
        </div>
    );
};

export default MainLayout;
