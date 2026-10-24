import { User } from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const cookieOptions = (req) => {
  const isSecureRequest = req.secure || req.headers["x-forwarded-proto"] === "https";
  return {
    httpOnly: true,
    sameSite: isSecureRequest ? "none" : "lax",
    secure: isSecureRequest,
  };
};

export const register = async (req, res) => {
  try {
    const { fullName, username, password, confirmPassword, gender } = req.body;

    if (!fullName || !username || !password || !confirmPassword || !gender) {
      return res.status(400).json({ message: "All fields are required", success: false });
    }

    // Reject non-string input (e.g. objects) before it reaches the database.
    if ([fullName, username, password, confirmPassword, gender].some((v) => typeof v !== "string")) {
      return res.status(400).json({ message: "Invalid input", success: false });
    }

    if (!["male", "female"].includes(gender)) {
      return res.status(400).json({ message: "Invalid gender", success: false });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
        success: false,
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match", success: false });
    }

    const cleanUsername = username.trim();
    const existing = await User.findOne({ username: cleanUsername });

    if (existing) {
      return res.status(400).json({ message: "Username already exists", success: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const encoded = encodeURIComponent(cleanUsername);
    const maleProfilePhoto = `https://avatar.iran.liara.run/public/boy?username=${encoded}`;
    const femaleProfilePhoto = `https://avatar.iran.liara.run/public/girl?username=${encoded}`;

    await User.create({
      fullName: fullName.trim(),
      username: cleanUsername,
      password: hashedPassword,
      profilePhoto: gender === "male" ? maleProfilePhoto : femaleProfilePhoto,
      gender,
    });

    return res.status(201).json({
      message: "Account created successfully.",
      success: true,
    });
  } catch (error) {
    // Duplicate key from a race between findOne and create.
    if (error?.code === 11000) {
      return res.status(400).json({ message: "Username already exists", success: false });
    }
    console.error("Register error:", error.message);
    return res.status(500).json({ message: "Internal server error.", success: false });
  }
};

/* ================= LOGIN ================= */
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "All fields are required", success: false });
    }

    if (typeof username !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "Invalid input", success: false });
    }

    const user = await User.findOne({ username: username.trim() });

    if (!user) {
      return res.status(400).json({
        message: "Incorrect username or password",
        success: false,
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "Incorrect username or password",
        success: false,
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1d",
    });

    return res
      .status(200)
      .cookie("token", token, { ...cookieOptions(req), maxAge: 24 * 60 * 60 * 1000 })
      .json({
        _id: user._id,
        username: user.username,
        fullName: user.fullName,
        profilePhoto: user.profilePhoto,
      });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ message: "Internal server error.", success: false });
  }
};

/* ================= LOGOUT ================= */
export const logout = (req, res) => {
  try {
    return res
      .status(200)
      .cookie("token", "", { ...cookieOptions(req), maxAge: 0 })
      .json({
        message: "Logged out successfully.",
        success: true,
      });
  } catch (error) {
    console.error("Logout error:", error.message);
    return res.status(500).json({ message: "Internal server error.", success: false });
  }
};

/* ================= OTHER USERS ================= */
export const getOtherUsers = async (req, res) => {
  try {
    // BUGFIX: this read req.user._id, but isAuthenticated only sets req.id,
    // so req.user was undefined and every call threw -> HTTP 500 -> the
    // sidebar contact list never loaded.
    const loggedInUserId = req.id;
    const otherUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
    return res.status(200).json(otherUsers);
  } catch (error) {
    console.error("getOtherUsers error:", error.message);
    return res.status(500).json({ message: "Internal server error.", success: false });
  }
};
