import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    theme: localStorage.getItem('theme') || 'light',
    sidebarOpen: true,
    globalLoading: false,
    activeModals: [], // array of modal IDs
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleTheme: (state) => {
            const newTheme = state.theme === 'light' ? 'dark' : 'light';
            state.theme = newTheme;
            localStorage.setItem('theme', newTheme);
        },
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },
        setGlobalLoading: (state, action) => {
            state.globalLoading = action.payload;
        },
        openModal: (state, action) => {
            if (!state.activeModals.includes(action.payload)) {
                state.activeModals.push(action.payload);
            }
        },
        closeModal: (state, action) => {
            state.activeModals = state.activeModals.filter(id => id !== action.payload);
        },
        closeAllModals: (state) => {
            state.activeModals = [];
        }
    }
});

export const { toggleTheme, toggleSidebar, setGlobalLoading, openModal, closeModal, closeAllModals } = uiSlice.actions;

// Selectors
export const selectTheme = (state) => state.ui.theme;
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectGlobalLoading = (state) => state.ui.globalLoading;
export const selectActiveModals = (state) => state.ui.activeModals;
export const selectIsModalOpen = (state, modalId) => state.ui.activeModals.includes(modalId);

export default uiSlice.reducer;
