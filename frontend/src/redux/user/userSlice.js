import { createSlice } from "@reduxjs/toolkit";



const initialState = {
    currentUser:null,
    token:null,
    error:null,
    loading:false
}

const userSlice = createSlice({
    name:'user',
    initialState,
    reducers:{
        signinStart:(state)=>{
            state.loading = true;
        },
        signinSucess:(state,action)=>{
            state.currentUser = action.payload.user;
            state.token = action.payload.token;
            state.loading=false;
            state.error=null;
        },
        signinFailure:(state,action)=>{
            state.error = action.payload
            state.loading=false;
        },
        clearError:(state,action)=>{
            state.error = null
        },
        updateUserStart:(state)=>{
            state.loading =true;
        },
        updateUserSuccess: (state, action) => {
            state.currentUser = action.payload;
            state.loading = false;
            state.error = null;
            },
        updateUserFailure: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        deleteUserStart: (state) => {
            state.loading = true;
        },
        deleteUserSuccess: (state) => {
            state.currentUser = null;
            state.loading = false;
            state.error = null;
        },
        deleteUserFailure: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        signOutUserStart: (state) => {
            state.loading = true;
        },
        signOutUserSuccess: (state) => {
            state.currentUser = null;
            state.loading = false;
            state.error = null;
        },
        signOutUserFailure: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
    }
})

export const 
{signinStart,
signinSucess,
signinFailure,
clearError,
updateUserStart,
updateUserSuccess,
updateUserFailure,
deleteUserFailure,
deleteUserStart,
deleteUserSuccess,
signOutUserFailure,
signOutUserStart,
signOutUserSuccess}  = userSlice.actions
export default userSlice.reducer