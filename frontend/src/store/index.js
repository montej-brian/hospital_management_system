import { configureStore } from '@reduxjs/toolkit';

// Reducers
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import patientReducer from './slices/patientSlice';
import appointmentReducer from './slices/appointmentSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        ui: uiReducer,
        patients: patientReducer,
        appointments: appointmentReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // Useful if dispatching complex objects/Dates
        }),
    devTools: process.env.NODE_ENV !== 'production',
});
