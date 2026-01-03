import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateTask } from './CreateTask';
import api from '../lib/api';
import { vi } from 'vitest';
import { Provider } from 'react-redux';
import { store } from '../store/store';

vi.mock('../lib/api', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        interceptors: { request: { use: vi.fn() } }
    }
}));

describe('CreateTask Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        api.get.mockResolvedValue({ data: [] });
    });

    const renderWithRedux = (component) => {
        return render(
            <Provider store={store}>
                {component}
            </Provider>
        );
    };

    test('renders create task button', () => {
        renderWithRedux(<CreateTask />);
        expect(screen.getByText('Create Task')).toBeInTheDocument();
    });

    test('opens modal when button is clicked', () => {
        renderWithRedux(<CreateTask />);

        fireEvent.click(screen.getByText('Create Task'));

        expect(screen.getByText('Create New Task')).toBeInTheDocument();
        expect(screen.getByLabelText('Title')).toBeInTheDocument();
    });

    test('submits form successfully', async () => {
        api.post.mockResolvedValue({ data: { id: 1, title: 'New Task' } });

        renderWithRedux(<CreateTask />);

        fireEvent.click(screen.getByText('Create Task'));

        fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'New Test Task' } });
        fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Test Desc' } });

        fireEvent.click(screen.getByText('Save Task'));

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/tasks', expect.objectContaining({
                title: 'New Test Task',
                description: 'Test Desc'
            }));
        });
    });
});
