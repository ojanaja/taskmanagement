
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { setSearchTerm } from "../store/taskSlice";
import { Button } from "@/components/ui/button";

const Header = () => {
    const { user } = useSelector((state) => state.auth);
    const { searchTerm } = useSelector((state) => state.tasks);
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 py-4 sticky top-0 z-10 w-full pl-72">
            <div className="flex-1 max-w-xl">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        placeholder="Search for anything..."
                        className="pl-10 bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-indigo-100 h-11 w-full rounded-xl"
                        value={searchTerm}
                        onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="h-8 w-px bg-gray-200 mx-2"></div>

                <div className="flex items-center gap-3">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-bold text-gray-800">{user?.username || "Admin"}</p>
                        <p className="text-xs text-gray-500">Member</p>
                    </div>
                    <img
                        src={`https://ui-avatars.com/api/?name=${user?.username || "Admin"}&background=random`}
                        alt="Profile"
                        className="w-10 h-10 rounded-full border-2 border-white shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                    />
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-500 hover:text-red-600 hover:bg-red-50">Log out</Button>
                </div>
            </div>
        </header>
    );
};

export default Header;
