import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    data: [],
    currentPage: 1,
    perPage: 3,
    isReload: false
};

const timekeepingTableSlice = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {
        setListTimekeepingTable(state, { payload }) {
            payload = payload || state.data;
            state.data = payload;
        },
        setCurrentPageTimekeepingTable(state, { payload }) {
            payload = payload || state.currentPage;
            state.currentPage = payload;
        },
        setIsReload(state, { payload }) {
            payload = payload || state.isReload;
            state.isReload = payload;
        }
    },
});

export const { setListTimekeepingTable, setCurrentPageTimekeepingTable, setIsReload } = timekeepingTableSlice.actions;

export default timekeepingTableSlice.reducer;
