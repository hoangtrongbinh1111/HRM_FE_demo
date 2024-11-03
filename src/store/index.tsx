import { combineReducers, configureStore } from '@reduxjs/toolkit';
import themeConfigSlice from './themeConfigSlice';
import humanListSlice from './humanListSlice';
import calendarSlice from './calendarSlice';
import timekeepingTableSlice from './timekeepingTableSlice';
const rootReducer = combineReducers({
    themeConfig: themeConfigSlice,
    humanList: humanListSlice,
    calendar: calendarSlice,
    timekeepingTable: timekeepingTableSlice
});

export default configureStore({
    reducer: rootReducer,
});

export type IRootState = ReturnType<typeof rootReducer>;
