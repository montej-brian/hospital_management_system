import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AppointmentService } from '../../services/apiService';

export const fetchAppointments = createAsyncThunk(
    'appointments/fetchAll',
    async (params, { rejectWithValue }) => {
        try {
            const data = await AppointmentService.getAll(params);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch appointments');
        }
    }
);

const initialState = {
    list: [],
    loading: false,
    error: null,
};

const appointmentSlice = createSlice({
    name: 'appointments',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchAppointments.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchAppointments.fulfilled, (state, action) => {
            state.loading = false;
            state.list = action.payload.data || action.payload;
        })
        .addCase(fetchAppointments.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    }
});

export const selectAllAppointments = (state) => state.appointments.list;
export const selectAppointmentsLoading = (state) => state.appointments.loading;

export default appointmentSlice.reducer;
