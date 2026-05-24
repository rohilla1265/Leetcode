import {configureStore } from "@reduxjs/toolkit";
import authReducer from "../authSlice";
// import reducer from "../authSlice";
export const store = configureStore({
    reducer:{
        auth: authReducer,
    }
});