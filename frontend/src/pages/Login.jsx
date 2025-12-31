import { useState } from 'react';
import { useAuth } from '../context/AuthProvider';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            setError('Invalid username or password');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <Input
                        label="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button type="submit" className="w-full">
                        Login
                    </Button>
                </form>
                <p className="mt-4 text-center text-sm text-gray-600">
                    Don't have an account? <Link to="/register" className="text-blue-500 hover:text-blue-700">Register</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
