import { createSlice } from "@reduxjs/toolkit";
import { logoutUser } from "../actions/userActions";

const initialState={
    loading:false,
    isAuthenticated:false,
    otpSent:false,
    otpVerfied:false,
    user:null,
    error:null,
    isUpdated:false,
    resendOtpLoading:false,
    resendOtpError:null
}
const authSlice=createSlice({
    name:"auth",
    initialState,
    reducers:{
        loginRequest(state){
            state.loading=true;
        },
        loginSuccess(state,action)
        {
            state.loading=false;
            state.isAuthenticated=true;
            state.user=action.payload.user;
            state.error=null;

        },
        loginFail(state,action)
        {
            state.loading=false;
            state.error=action.payload

        },
        loadUserRequest(state){
           state.isAuthenticated=false;
           state.loading=true;
           state.error=null;
        },
        loadUserSuccess(state,action)
        {
            state.loading=false;
            state.isAuthenticated=true;
            state.user=action.payload.user;
        },
        loadUserFail(state,action)
        {
            state.loading=false;
            state.error=action.payload;

        },
        clearError(state)
        {
            state.error=null
        },
        registerRequest(state){
            state.loading=true;
            state.otpSent=false;
        },
        registerSuccess(state,action)
        {
            state.loading=false;
            state.otpSent=true;
            state.user=action.payload.user;
       

        },
        registerFail(state,action)
        {
            state.loading=false;
            state.error=action.payload

        },
        otpVerifyRequest(state){
            state.loading=true;
            state.otpVerfied=false;
        },
        otpVerifySuccess(state,action)
        {
            state.loading=false;
            state.otpVerfied=true;
            state.isAuthenticated=true;
            state.user=action.payload.user;
       

        },
        otpVerifyFail(state,action)
        {
            state.loading=false;
            state.error=action.payload;
            state.otpVerfied=false;

        },
        resendOtpRequest(state){
            state.resendOtpLoading=true;
            state.resendOtpError=null;
        },
        resendOtpSuccess(state,action)
        {
            state.resendOtpLoading=false;
           state.otpSent=true;
       

        },
        resendOtpFail(state,action)
        {
           
            state.resendOtpLoading=false;
            state.resendOtpError=action.payload;

        },
            
        
        logOutSuccess(state){
            state.loading=false;
            state.isAuthenticated=false;
            state.user=null;
            state.otpSent=false;
            state.otpVerfied=false;
        },
        logOutFail(state,action)
        {
            state.error=action.payload
        }
    },
   extraReducers:(builder)=>{
    builder
    .addCase(logoutUser.pending,(state)=>{
        state.loading=true;
    })
    .addCase(logoutUser.fulfilled,(state)=>{
        state.loading=false;
        state.isAuthenticated=false;
        state.user=null;
        state.otpSent=false;
        state.otpVerfied=false;
    })
    .addCase(logoutUser.rejected,(state,action)=>{
        state.loading=false;
        state.error=action.payload
    })
   },

})

export const {loginRequest,loginSuccess,loginFail,registerRequest,registerSuccess,registerFail,otpVerifyRequest,
otpVerifySuccess,otpVerifyFail,
logOutSuccess,logOutFail,
resendOtpRequest,resendOtpSuccess,resendOtpFail,clearError,loadUserRequest,loadUserSuccess,
loadUserFail
}=authSlice.actions;

export default authSlice.reducer