import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { register, clearAuthError } from "../actions/userActions";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, isAuthenticated, otpSent } = useSelector(
    (state) => state.authState
  );

  const onChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });

    if (e.target.name === "password") {
      validatePassword(e.target.value);
    }
  };

  const validatePassword = (password) => {
    const passRegex =
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,20}$/;
    if (!passRegex.test(password)) {
      setPasswordError(
        "Password must be 6-20 characters long and include at least one uppercase, one lowercase letter, one digit, and one special character."
      );
    } else {
      setPasswordError("");
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();

    if (passwordError) {
      toast.error("Please fix the password issue before submitting.", {
        position: "bottom-center",
      });
      return;
    }

    const formData = {
      name: userData.name,
      email: userData.email,
      password: userData.password,
    };

    dispatch(register(formData));
  };

  useEffect(() => {
    if (otpSent) {
      toast.success("OTP sent to your email!", { position: "bottom-center" });
      navigate("/verify-otp", { state: { email: userData.email } });
    }

    if (isAuthenticated) {
      navigate("/");
    }

    if (error) {
      toast.error(error, {
        position: "bottom-center",
        onClose: () => dispatch(clearAuthError()),
      });
    }
  }, [otpSent, isAuthenticated, error, dispatch, navigate, userData.email]);

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-10 col-md-6 col-lg-4">
          <form onSubmit={submitHandler} className="shadow-lg p-4 bg-light rounded">
            <div className="text-center mb-4">
             
              <h3 className="mt-3">Register as a Customer</h3>
            </div>

            <div className="form-group mb-3">
              <label htmlFor="name_field">Name</label>
              <input
                name="name"
                onChange={onChange}
                type="text"
                id="name_field"
                className="form-control"
                value={userData.name}
                required
              />
            </div>

            <div className="form-group mb-3">
              <label htmlFor="email_field">Email</label>
              <input
                type="email"
                id="email_field"
                name="email"
                onChange={onChange}
                className="form-control"
                value={userData.email}
                required
              />
            </div>

            <div className="form-group mb-3">
              <label htmlFor="password_field">Password</label>
              <div className="position-relative">
                <input
                  name="password"
                  onChange={onChange}
                  type={showPassword ? "text" : "password"}
                  id="password_field"
                  className="form-control"
                  value={userData.password}
                  required
                />
                <button
                  type="button"
                  className="btn btn-sm position-absolute end-0 top-50 translate-middle-y"
                  style={{ background: "transparent", border: "none" }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i
                    className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                    style={{ color: "#000" }}
                  ></i>
                </button>
              </div>
              {passwordError && (
                <small className="text-danger">{passwordError}</small>
              )}
            </div>

            <button
              id="register_button"
              type="submit"
              className="btn btn-primary btn-block py-2 w-100"
              disabled={loading}
            >
              {loading ? "Loading..." : "Register"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
