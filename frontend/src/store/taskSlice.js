import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../lib/api';

// Async Thunks
export const fetchTasks = createAsyncThunk(
    'tasks/fetchTasks',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/tasks');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
        }
    }
);

export const createTask = createAsyncThunk(
    'tasks/createTask',
    async (taskData, { rejectWithValue }) => {
        try {
            const response = await api.post('/tasks', taskData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create task');
        }
    }
);

export const updateTask = createAsyncThunk(
    'tasks/updateTask',
    async ({ id, updates }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/tasks/${id}`, updates);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update task');
        }
    }
);

export const deleteTask = createAsyncThunk(
    'tasks/deleteTask',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/tasks/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete task');
        }
    }
);

const initialState = {
    items: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

const taskSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        // Optimistic update for Drag and Drop
        updateTaskStatusOptimistic: (state, action) => {
            const { id, status } = action.payload;
            const existingTask = state.items.find(task => task.id === id);
            if (existingTask) {
                existingTask.status = status;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchTasks.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchTasks.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchTasks.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // Create
            .addCase(createTask.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            // Update
            .addCase(updateTask.fulfilled, (state, action) => {
                const index = state.items.findIndex(task => task.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            // Delete
            .addCase(deleteTask.fulfilled, (state, action) => {
                state.items = state.items.filter(task => task.id !== action.payload);
            });
    },
});

export const { updateTaskStatusOptimistic } = taskSlice.actions;
export default taskSlice.reducer;
