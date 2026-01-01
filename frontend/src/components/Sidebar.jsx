
import { Home, Users, FolderKanban } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
    const location = useLocation();

    const menuItems = [
        { icon: Home, label: "Home", path: "/" },
        { icon: FolderKanban, label: "Tasks", path: "/tasks" },
        { icon: Users, label: "Members", path: "/members" },
    ];

    return (
        <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col p-6 fixed left-0 top-0 z-10">
            <div className="flex items-center gap-2 mb-10 px-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">S</span>
                </div>
                <h1 className="text-xl font-bold text-gray-800 tracking-tight">SlothUI</h1>
            </div>

            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                ? "bg-indigo-50 text-indigo-600 font-semibold"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"}`} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};

export default Sidebar;
