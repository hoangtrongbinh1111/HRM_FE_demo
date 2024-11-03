import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    data: [],
    currentPage: 1,
    perPage: 3,
    isReload: false
};

const humanListSlice = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {
        setListHuman(state, { payload }) {
            payload = payload || state.data;
            state.data = payload;
        },
        setCurrentPageHuman(state, { payload }) {
            payload = payload || state.currentPage;
            state.currentPage = payload;
        },
        setIsReload(state, { payload }) {
            payload = payload || state.isReload;
            state.isReload = payload;
        }
    },
});

export const { setListHuman, setCurrentPageHuman, setIsReload } = humanListSlice.actions;

export default humanListSlice.reducer;
