import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "../redux/userSlice";
import { BASE_URL } from "../config";

const Login = () => {
  const [user, setUser] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { authUser } = useSelector((store) => store.user);

  // Already logged in? Go straight to the chat.
  useEffect(() => {
    if (authUser) navigate("/");
  }, [authUser, navigate]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/api/v1/user/login`, user, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      dispatch(setAuthUser(res.data));
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed. Please try again.");
      console.error("Login error:", error);
      // Keep the username so the user only has to retype the password.
      setUser((prev) => ({ ...prev, password: "" }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="w-full p-6 rounded-lg shadow-md bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-10 border border-gray-100">
        <h1 className="text-3xl font-bold text-center">Login</h1>
        <form onSubmit={onSubmitHandler}>
          <div>
            <label htmlFor="username" className="label p-2">
              <span className="text-base label-text">Username</span>
            </label>
            <input
              id="username"
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              className="w-full input input-bordered h-10"
              type="text"
              placeholder="Username"
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="password" className="label p-2">
              <span className="text-base label-text">Password</span>
            </label>
            <input
              id="password"
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              className="w-full input input-bordered h-10"
              type="password"
              placeholder="Password"
              autoComplete="current-password"
            />
          </div>
          <p className="text-center my-2">
            Don't have an account? <Link to="/signup"> signup </Link>
          </p>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-block btn-sm mt-2 border border-slate-700 disabled:opacity-60"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
