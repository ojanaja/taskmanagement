import React, { useEffect, useState } from 'react';
import api from '../lib/api';

const UserSelect = ({ value, onChange, placeholder = "Assign to..." }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get('/users');
                setUsers(response.data);
            } catch (error) {
                console.error("Failed to fetch users", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (loading) {
        return <div className="text-xs text-muted-foreground">Loading users...</div>;
    }

    return (
        <select
            value={value || ""}
            onChange={(e) => onChange(e.target.value || null)}
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
            <option value="">{placeholder}</option>
            {users.map((user) => (
                <option key={user.id} value={user.id}>
                    {user.username}
                </option>
            ))}
        </select>
    );
};

export default UserSelect;
