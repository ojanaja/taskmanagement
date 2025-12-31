
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Shield, User as UserIcon } from "lucide-react";

const Members = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get("/users");
                setUsers(response.data);
            } catch (error) {
                console.error("Failed to fetch users", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Team Members</h1>
                <p className="text-gray-500 mt-1">Manage and view all registered users.</p>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading members...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.map((user) => (
                        <Card key={user.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${user.username}&background=random`}
                                    alt={user.username}
                                    className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                                />
                                <div>
                                    <CardTitle className="text-lg">{user.username}</CardTitle>
                                    <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                                        ID: {user.id}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <span>{user.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-gray-400" />
                                    {/* Display roles if available, else standard user */}
                                    <span>
                                        {user.roles && user.roles.length > 0
                                            ? user.roles.map(r => r.name).join(", ")
                                            : "Member"}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </Layout>
    );
};

export default Members;
