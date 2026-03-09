import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PatientService } from '../../services/apiService';

export const fetchPatients = createAsyncThunk(
    'patients/fetchAll',
    async (params, { rejectWithValue }) => {
        try {
            const data = await PatientService.getAll(params);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch patients');
        }
    }
);

export const fetchPatientById = createAsyncThunk(
    'patients/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const data = await PatientService.getById(id);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch patient details');
        }
    }
);

const initialState = {
    list: [], // Normalized ideally, but raw array is fine for now
    selectedPatient: null,
    totalCount: 0,
    loading: false,
    error: null,
};

const patientSlice = createSlice({
    name: 'patients',
    initialState,
    reducers: {
        clearSelectedPatient: (state) => {
            state.selectedPatient = null;
        }
    },
    extraReducers: (builder) => {
        // Fetch All
        builder.addCase(fetchPatients.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchPatients.fulfilled, (state, action) => {
            state.loading = false;
            // Assuming API returns { data: [], total: 0 }
            if (action.payload.data) {
                state.list = action.payload.data;
                state.totalCount = action.payload.total || action.payload.data.length;
            } else {
                state.list = action.payload; // Fallback
                state.totalCount = action.payload.length;
            }
        })
        .addCase(fetchPatients.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // Fetch By ID
        builder.addCase(fetchPatientById.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchPatientById.fulfilled, (state, action) => {
            state.loading = false;
            state.selectedPatient = action.payload;
        })
        .addCase(fetchPatientById.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    }
});

export const { clearSelectedPatient } = patientSlice.actions;

export const selectAllPatients = (state) => state.patients.list;
export const selectPatientLoading = (state) => state.patients.loading;
export const selectSelectedPatient = (state) => state.patients.selectedPatient;

export default patientSlice.reducer;
