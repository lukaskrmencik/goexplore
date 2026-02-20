import Sidebar from "./components/Sidebar";
import BottomBar from "./components/BottomBar";
import MobileHeader from "./components/MobileHeader";

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />

            <div className="flex flex-1 flex-col md:ml-64">
                <MobileHeader />

                {/* Main content wrapper - padding bottom for navbar mobile */}
                <main className="flex-1 pb-20 md:pb-0">
                    <div className="mx-auto max-w-7xl p-4 md:p-8">
                        {children}
                    </div>
                </main>
            </div>

            <BottomBar />
        </div>
    );
};

export default MainLayout;
