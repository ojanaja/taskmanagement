import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';
import { AuthProvider } from '../context/AuthProvider';
import { describe, it, expect, vi } from 'vitest';

// Mock the useAuth hook if needed or mock axios
// For integration test style, we can mock the context value
const mockLogin = vi.fn();

vi.mock('../context/AuthProvider', async () => {
    const actual = await vi.importActual('../context/AuthProvider');
    return {
        ...actual,
        useAuth: () => ({
            login: mockLogin,
        }),
        AuthProvider: ({ children }) => <div>{children}</div>
    };
});

// Mock UI components to avoid issues with specialized shadcn components if complex
// But for now, we assume they work as standard React components
vi.mock('@/components/ui/input', () => ({
    Input: (props) => <input data-testid="mock-input" {...props} />
}));

vi.mock('@/components/ui/button', () => ({
    Button: (props) => <button data-testid="mock-button" {...props}>{props.children}</button>
}));

describe('Login Component', () => {
    it('renders login form correctly', () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
        expect(screen.getAllByTestId('mock-input')[0]).toBeInTheDocument(); // Username
        expect(screen.getAllByTestId('mock-input')[1]).toBeInTheDocument(); // Password
    });

    it('submits form with username and password', async () => {
        mockLogin.mockResolvedValue(true);

        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        const usernameInput = screen.getAllByTestId('mock-input')[0];
        const passwordInput = screen.getAllByTestId('mock-input')[1];
        const submitButton = screen.getByTestId('mock-button');

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
    });
});
