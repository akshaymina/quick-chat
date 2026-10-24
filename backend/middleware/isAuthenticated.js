import jwt from "jsonwebtoken";


const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "User not authenticated."
      })
    };

    const decode = await jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!decode) {
      return res.status(401).json({
        message: "Invalid token"
      });
    };

    // req.id is the canonical source of the authenticated user's ObjectId
    // across the whole app (controllers read req.id, not req.user).
    req.id = decode.userId;   // { userId: user._id }, while sign token
    next();
  } catch (error) {
    // jwt.verify throws on expired/invalid/tampered tokens (JsonWebTokenError,
    // TokenExpiredError). Without a response here, the request hangs until
    // the client times out instead of failing fast with 401.
    console.error("Auth middleware error:", error.message);
    return res.status(401).json({
      message: "Invalid or expired session. Please log in again.",
      success: false,
    });
  }
};
export default isAuthenticated;
