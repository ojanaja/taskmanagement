import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { TaskList } from '../components/TaskList';
import api from '../lib/api';
import { vi } from 'vitest';

// Mock the API module
vi.mock('../lib/api');

describe('TaskList Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('renders tasks fetched from API', async () => {
        const mockTasks = [
            { id: 1, title: 'Task 1', description: 'Description 1', status: 'PENDING', createdAt: '2023-01-01' },
            { id: 2, title: 'Task 2', description: 'Description 2', status: 'COMPLETED', createdAt: '2023-01-02' }
        ];

        api.get.mockResolvedValue({ data: mockTasks });

        render(<TaskList />);

        expect(screen.getByText('Loading tasks...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('Task 1')).toBeInTheDocument();
            expect(screen.getByText('Task 2')).toBeInTheDocument();
        });

        expect(screen.getByText('Description 1')).toBeInTheDocument();
        expect(screen.getByText('COMPLETED')).toBeInTheDocument();
    });

    test('renders empty state when no tasks', async () => {
        api.get.mockResolvedValue({ data: [] });

        render(<TaskList />);

        await waitFor(() => {
            expect(screen.getByText(/No tasks found/i)).toBeInTheDocument();
        });
    });

    test('handles API failure gracefully', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        api.get.mockRejectedValue(new Error('Network error'));

        render(<TaskList />);

        await waitFor(() => {
            expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
        });

        // In a real app we might show an error message, but currently we just stop loading
        // Check that console.error was called
        expect(consoleSpy).toHaveBeenCalledWith("Failed to fetch tasks", expect.any(Error));

        consoleSpy.mockRestore();
    });
});
