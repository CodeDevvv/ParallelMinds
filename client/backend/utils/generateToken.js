import jwt from "jsonwebtoken";
import process from 'process';

export const generateToken = (userID) => {
  return jwt.sign({ id: userID }, process.env.JWT_SECRET_KEY, { expiresIn: "30d" })
}

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Token expired. Please log in again.");
    } else if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid token. Authentication failed.");
    } else {
      throw new Error("Token verification failed.");
    }
  }
};

/**
 * Extracts User ID from a token safely
 */
export const getUserIdFromToken = (token) => {
  try {
    if (!token) return null;

    const decoded = verifyToken(token);
    return decoded?.id || null;
  } catch (error) {
    console.error("Token Verification Failed:", error.message);
    return null;
  }
};
