import { createSlice } from "@reduxjs/toolkit";
// import { PayloadAction } from "@reduxjs/toolkit";



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
        }
    }
})

export const {signinStart,signinSucess,signinFailure,clearError}  = userSlice.actions
export default userSlice.reducer