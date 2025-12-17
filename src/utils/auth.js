import User from "../models/user.js";
import { ApiError } from "./ApiError.js";
import jwt from "jsonwebtoken";

const verifyJWT = async (req, res, next) => {
  try {
    let token = null;

    // 1. Extract token from cookies
    if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    // 2. Extract token from Authorization header
    else if (req.header("Authorization")) {
      const authHeader = req.header("Authorization");
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1].trim();
      }
    }

    // 3. If no token → Unauthorized
    if (!token) {
      throw new ApiError(401, "Unauthorized: No token provided");
    }

    // 4. Verify token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodedToken?.id) {
      throw new ApiError(401, "Invalid token payload");
    }

    // 5. Fetch user from DB (exclude password)
    const dbUser = await User.findByPk(decodedToken.id, {
      attributes: { exclude: ["password"] },
    });

    if (!dbUser) {
      throw new ApiError(400, "User not found or invalid token");
    }

    // 6. Attach user to request
    req.user = dbUser;
    next();

  } catch (err) {
    console.error("JWT Verification Error:", err.message);

    let statusCode = 401;
    let message = "Unauthorized";

    if (err.name === "TokenExpiredError") {
      message = "Token has expired, please login again";
    } else if (err.name === "JsonWebTokenError") {
      message = "Invalid token";
    } else if (err instanceof ApiError) {
      statusCode = err.statusCode;
      message = err.message;
    }

    return res.status(statusCode).json({ status: false, message });
  }
};

export default verifyJWT;
