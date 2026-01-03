import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import { vi } from 'vitest';
import api from '../lib/api';

vi.mock('../lib/api', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        interceptors: { request: { use: vi.fn() } }
    }
}));

describe('Login Component', () => {
    const renderWithRedux = (component) => render(
        <Provider store={store}>
            <BrowserRouter>
                {component}
            </BrowserRouter>
        </Provider>
    );

    test('renders login form correctly', () => {
        renderWithRedux(<Login />);
        expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
        expect(screen.getByLabelText('Username')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    });

    test('submits form with username and password', async () => {
        api.post.mockResolvedValue({
            data: {
                accessToken: 'fake-token',
                username: 'testuser',
                roles: ['ROLE_USER']
            }
        });

        renderWithRedux(<Login />);

        fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: 'Login' }));

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/auth/login', {
                username: 'testuser',
                password: 'password123'
            });
        });
    });
});
