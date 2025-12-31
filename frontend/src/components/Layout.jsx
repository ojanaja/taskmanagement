
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <Sidebar />
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1 pl-64 p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
