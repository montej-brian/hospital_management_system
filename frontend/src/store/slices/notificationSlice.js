import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// Thunks
export const fetchNotifications = createAsyncThunk(
    'notifications/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/notifications');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
        }
    }
);

export const markAsRead = createAsyncThunk(
    'notifications/markRead',
    async (id, { rejectWithValue }) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update notification');
        }
    }
);

export const fetchPreferences = createAsyncThunk(
    'notifications/fetchPrefs',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/notifications/preferences');
            return response.data;
        } catch (error) {
            return rejectWithValue('Failed to fetch preferences');
        }
    }
);

export const updatePreferences = createAsyncThunk(
    'notifications/updatePrefs',
    async (prefs, { rejectWithValue }) => {
        try {
            await api.patch('/notifications/preferences', prefs);
            return prefs;
        } catch (error) {
            return rejectWithValue('Failed to update preferences');
        }
    }
);

const initialState = {
    items: [],
    preferences: { email_enabled: true, sms_enabled: false, in_app_enabled: true },
    loading: false,
    error: null,
};

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        addRealtimeNotification: (state, action) => {
            state.items.unshift(action.payload); // Add to top of list
        },
        clearAll: (state) => {
            state.items = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch All
            .addCase(fetchNotifications.pending, (state) => { state.loading = true; })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Mark Read
            .addCase(markAsRead.fulfilled, (state, action) => {
                const item = state.items.find(i => i.id === action.payload);
                if (item) item.is_read = true;
            })
            // Fetch Prefs
            .addCase(fetchPreferences.fulfilled, (state, action) => {
                state.preferences = action.payload;
            })
            // Update Prefs
            .addCase(updatePreferences.fulfilled, (state, action) => {
                state.preferences = { ...state.preferences, ...action.payload };
            });
    }
});

export const { addRealtimeNotification, clearAll } = notificationSlice.actions;

export const selectAllNotifications = (state) => state.notifications.items;
export const selectUnreadCount = (state) => state.notifications.items.filter(n => !n.is_read).length;
export const selectNotificationPrefs = (state) => state.notifications.preferences;

export default notificationSlice.reducer;
