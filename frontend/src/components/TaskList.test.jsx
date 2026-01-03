import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { TaskList } from '../components/TaskList';
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

describe('TaskList Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderWithRedux = (component) => {
        return render(
            <Provider store={store}>
                {component}
            </Provider>
        );
    };

    test('renders tasks fetched from API', async () => {
        const mockTasks = [
            { id: 1, title: 'Task 1', description: 'Description 1', status: 'PENDING', createdAt: '2023-01-01' },
            { id: 2, title: 'Task 2', description: 'Description 2', status: 'COMPLETED', createdAt: '2023-01-02' }
        ];

        api.get.mockResolvedValue({ data: mockTasks });

        renderWithRedux(<TaskList />);

        await waitFor(() => {
            expect(screen.getByText('Task 1')).toBeInTheDocument();
            expect(screen.getByText('Task 2')).toBeInTheDocument();
        });

        expect(screen.getByText('Description 1')).toBeInTheDocument();
    });

    test('renders tasks with deadline and attachments', async () => {
        const mockTasks = [
            {
                id: 1,
                title: 'Full Task',
                description: 'Has everything',
                status: 'PENDING',
                dueDate: '2023-12-31T00:00:00.000Z',
                attachments: ['file1.png', 'file2.png']
            }
        ];

        api.get.mockResolvedValue({ data: mockTasks });

        renderWithRedux(<TaskList />);

        await waitFor(() => {
            expect(screen.getByText('Full Task')).toBeInTheDocument();
        });

        expect(screen.getByText('2')).toBeInTheDocument();
    });

    test('renders columns even when no tasks', async () => {
        api.get.mockResolvedValue({ data: [] });

        renderWithRedux(<TaskList />);

        await waitFor(() => {
            expect(screen.getByText('To Do')).toBeInTheDocument();
            expect(screen.getByText('In Progress')).toBeInTheDocument();
            expect(screen.getByText('Done')).toBeInTheDocument();
        });

        const zeros = screen.getAllByText('0');
        expect(zeros).toHaveLength(3);
    });

    test('opens edit modal and deletes task', async () => {
        const mockTask = { id: 1, title: 'Task to Delete', description: 'Desc', status: 'PENDING' };
        api.get.mockResolvedValue({ data: [mockTask] });
        api.delete.mockResolvedValue({});

        const confirmSpy = vi.spyOn(window, 'confirm');
        confirmSpy.mockImplementation(() => true);

        renderWithRedux(<TaskList />);

        await waitFor(() => {
            expect(screen.getByText('Task to Delete')).toBeInTheDocument();
        });

        fireEvent.doubleClick(screen.getByText('Task to Delete'));

        fireEvent.click(screen.getByText('Delete'));

        await waitFor(() => {
            expect(api.delete).toHaveBeenCalledWith('/tasks/1');
        });

        confirmSpy.mockRestore();
    });

    test('opens edit modal and updates task status', async () => {
        const mockTask = { id: 1, title: 'Task to Move', description: 'Desc', status: 'PENDING' };
        api.get.mockResolvedValue({ data: [mockTask] });
        api.put.mockResolvedValue({ data: { ...mockTask, status: 'IN_PROGRESS' } });

        renderWithRedux(<TaskList />);

        await waitFor(() => {
            expect(screen.getByText('Task to Move')).toBeInTheDocument();
        });

        fireEvent.doubleClick(screen.getByText('Task to Move'));

        fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'IN_PROGRESS' } });

        fireEvent.click(screen.getByText('Save'));

        await waitFor(() => {
            expect(api.put).toHaveBeenCalledWith('/tasks/1', expect.objectContaining({
                status: 'IN_PROGRESS'
            }));
        });
    });
});
