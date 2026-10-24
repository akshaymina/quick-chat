import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";

const initialUser = {
  fullName: "",
  username: "",
  password: "",
  confirmPassword: "",
  gender: "",
};

const Signup = () => {
  const [user, setUser] = useState(initialUser);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleCheckbox = (gender) => {
    setUser({ ...user, gender });
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // Cheap client-side checks so obvious mistakes don't cost a round trip.
    if (user.password !== user.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!user.gender) {
      toast.error("Please select a gender");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/api/v1/user/register`, user, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setUser(initialUser);
        navigate("/login");
      }
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || "Request failed";
      toast.error(message);
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="w-full p-6 rounded-lg shadow-md bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-10 border border-gray-100">
        <h1 className="text-3xl font-bold text-center">Signup</h1>
        <form onSubmit={onSubmitHandler}>
          <div>
            <label htmlFor="fullname" className="label p-2">
              <span className="text-base label-text">Full Name</span>
            </label>
            <input
              id="fullname"
              value={user.fullName}
              onChange={(e) => setUser({ ...user, fullName: e.target.value })}
              className="w-full input input-bordered h-10"
              type="text"
              placeholder="Full Name"
              autoComplete="name"
            />
          </div>
          <div>
            <label htmlFor="signup-username" className="label p-2">
              <span className="text-base label-text">Username</span>
            </label>
            <input
              id="signup-username"
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              className="w-full input input-bordered h-10"
              type="text"
              placeholder="Username"
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="signup-password" className="label p-2">
              <span className="text-base label-text">Password</span>
            </label>
            <input
              id="signup-password"
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              className="w-full input input-bordered h-10"
              type="password"
              placeholder="Password (min 6 characters)"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label htmlFor="signup-confirm" className="label p-2">
              <span className="text-base label-text">Confirm Password</span>
            </label>
            <input
              id="signup-confirm"
              value={user.confirmPassword}
              onChange={(e) =>
                setUser({ ...user, confirmPassword: e.target.value })
              }
              className="w-full input input-bordered h-10"
              type="password"
              placeholder="Confirm Password"
              autoComplete="new-password"
            />
          </div>
          <div className="flex items-center my-4">
            <div className="flex items-center">
              <p>Male</p>
              <input
                type="checkbox"
                checked={user.gender === "male"}
                onChange={() => handleCheckbox("male")}
                className="checkbox mx-2"
              />
            </div>
            <div className="flex items-center">
              <p>Female</p>
              <input
                type="checkbox"
                checked={user.gender === "female"}
                onChange={() => handleCheckbox("female")}
                className="checkbox mx-2"
              />
            </div>
          </div>
          <p className="text-center my-2">
            Already have an account? <Link to="/login"> login </Link>
          </p>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-block btn-sm mt-2 border border-slate-700 disabled:opacity-60"
            >
              {isLoading ? "Signing up..." : "Signup"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
