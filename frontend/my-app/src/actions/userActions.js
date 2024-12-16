import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

import { clearError, loadUserFail, loadUserRequest, loadUserSuccess, loginFail, loginRequest, loginSuccess, otpVerifyFail, otpVerifyRequest, otpVerifySuccess, registerFail, registerRequest, registerSuccess, resendOtpFail, resendOtpRequest, resendOtpSuccess } from "../slices/authSlice";

export const login=(email,password)=>async(dispatch)=>{
    try {
        dispatch(loginRequest());
        const {data}=await axios.post(`/login`,{email,password})
        dispatch(loginSuccess(data))
    } catch (error) {
        dispatch(loginFail(error.response.data.message))
    }
}
export const register = (formData) => async (dispatch) => { // Adjusted to accept formData
    try {
        dispatch(registerRequest());
        const response = await axios.post('/register', formData); // Adjust URL as necessary
        dispatch(registerSuccess(response.data));
    } catch (error) {
        const errorMessage = error.response?.data?.message || "Registration failed";
        dispatch(registerFail(errorMessage));
    }
};
export const verifyOTP=(email,otp)=> async (dispatch)=>{
    try {
        dispatch(otpVerifyRequest());
        const response=await axios.post('/otp-verify',{email,otp});
        dispatch(otpVerifySuccess(response.data))
     } catch (error) {
        const errorMessage=error.response?.data?.message || " otp verification is Failed"

        dispatch(otpVerifyFail(errorMessage))
     }
  
}
export const resendOtp=(email)=> async (dispatch)=>{
    try {
        dispatch(resendOtpRequest());
        const response=await axios.post('/resend-otp',{email});
        dispatch(resendOtpSuccess(response.data))
     } catch (error) {
        const errorMessage=error.response?.data?.message || "Resend otp is Failed"

        dispatch(resendOtpFail(errorMessage))
     }
  
}
export const clearAuthError=()=>(dispatch)=>{
    dispatch(clearError())
}
export const logoutUser=createAsyncThunk('auth/logout',async ()=>{
    const response=await axios.get('/logout')
    return response.data;
})
export const loadUser=createAsyncThunk('user/loadUser',async(__dirname,{dispatch})=>{
    try {
        dispatch(loadUserRequest());
        const {data}=await axios.get('/profile');
        dispatch(loadUserSuccess(data))
    } catch (error) {
        dispatch(loadUserFail(error.response.data.message));
        throw error;
    }
})