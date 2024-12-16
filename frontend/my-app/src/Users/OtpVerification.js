import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { verifyOTP, resendOtp } from "../actions/userActions"; // Import resendOtp
import { clearError } from "../slices/authSlice"; // Import the clearError action
import { toast } from 'react-toastify';
import { useLocation } from "react-router-dom";

export default function OtpVerification() {
    const location = useLocation();
    const dispatch = useDispatch();
   
    const email = location.state?.email; // Get email passed from Register component
    console.log("Email for OTP:", email); // Log the email to verify

    const [otp, setOtp] = useState("");
   
    // Get relevant state from the Redux store
    const { loading, error, isAuthenticated, resendOtpLoading, resendOtpError } = useSelector(state => state.authState);

    const submitHandler = (e) => {
        e.preventDefault();
        dispatch(verifyOTP(email, otp)); // Call verifyOTP action with email and OTP
    };

    const handleResendOtp = () => {
        if (email) { // Check if email is valid
            dispatch(resendOtp(email)); 
            toast.success(`Otp Resended to ${email}  `,{
                position:'bottom-center',
            })

            // Call resendOtp action with email
        } else {
            toast.error("Email is not defined. Cannot resend OTP.", {
                position: 'bottom-center',
            });
        }
    };

    // Handle side effects for successful verification or error messages
    useEffect(() => {
        if (isAuthenticated) {
            toast.success("OTP verified successfully!", { position: 'bottom-center' });
            // Redirect or perform actions after successful authentication
        }
        if (error) {
            toast.error(error, {
                position: 'bottom-center',
            });
            dispatch(clearError()); // Dispatch the action to clear the error
        }
        if (resendOtpError) {
            toast.error(resendOtpError, {
                position: 'bottom-center',
            });
            dispatch(clearError()); // Dispatch the action to clear the error
        }
    }, [isAuthenticated, error, resendOtpError, dispatch]);

    return (
        <div>
            <h1>OTP Verification</h1>
            <div className="col-10 col-lg-5">
                <form onSubmit={submitHandler}>
                    <div className="form-group">
                    
                    <center>Electric & Tech World
                    <h4 className="mb-3"></h4>
                        <label htmlFor="otp_field">Enter OTP</label></center><br/>
                      
                        <input
                            type="text"
                            id="otp_field"
                            className="form-control"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? "Verifying..." : "Verify OTP"}
                    </button>
                </form>
                <button onClick={handleResendOtp} className="btn btn-secondary mt-3" disabled={resendOtpLoading}>
                    {resendOtpLoading ? "Resending..." : "Resend OTP"}
                </button>
            </div>
        </div>
    );
}
