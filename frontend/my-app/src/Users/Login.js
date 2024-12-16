import { Fragment, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearAuthError, login } from "../actions/userActions";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.authState
  );
  const redirect = location.search
    ? `/${location.search.split("=")[1]}`
    : "/";

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(login(email, password));
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirect);
    }

    if (error) {
      toast.error(error, {
        position: "bottom-center",
        onClose: () => {
          dispatch(clearAuthError());
        },
      });
    }
  }, [error, isAuthenticated, dispatch, navigate, redirect]);

  return (
    <Fragment>
      <div className="row justify-content-center align-items-center min-vh-100 bg-light">
        <div className="col-10 col-md-6 col-lg-4">
          <form
            onSubmit={submitHandler}
            className="shadow-lg p-4 rounded bg-white"
          >
            <center>
             
              <h4 className="my-3 text-primary">
               Login
              </h4>
            </center>
            <div className="form-group mb-3">
              <label htmlFor="email_field" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email_field"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group mb-3">
              <label htmlFor="password_field" className="form-label">
                Password
              </label>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password_field"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i
                    className={`fa ${
                      showPassword ? "fa-eye-slash" : "fa-eye"
                    }`}
                  ></i>
                </button>
              </div>
            </div>

            <div className="d-flex justify-content-between mb-3">
              <Link to="/password/forgot" className="text-decoration-none">
                Forgot Password?
              </Link>
              <Link to="/register" className="text-decoration-none">
                New User?
              </Link>
            </div>

            <button
              id="login_button"
              type="submit"
              className="btn btn-primary btn-block w-100 py-2"
              disabled={loading}
            >
              {loading ? "Loading..." : "LOGIN"}
            </button>
          </form>
        </div>
      </div>
    </Fragment>
  );
}
