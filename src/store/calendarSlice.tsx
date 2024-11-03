import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    startDate: null,
    endDate: null,
};

const calendarSlice = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {
        setStartDate(state, { payload }) {
            payload = payload || state.startDate;
            state.startDate = payload;
        },
        setEndDate(state, { payload }) {
            payload = payload || state.endDate;
            state.endDate = payload;
        },
        clearDate(state) {
            state.startDate = null;
            state.endDate = null;
        }
    },
});

export const { setStartDate, setEndDate, clearDate } = calendarSlice.actions;

export default calendarSlice.reducer;
