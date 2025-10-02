import jwt from "jsonwebtoken"
import process from 'process';

export const generateToken = ( userID ) => {
    return jwt.sign({ id: userID}, process.env.JWT_SECRET_KEY, { expiresIn : "30d" })
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
