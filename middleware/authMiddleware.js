import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided. Authorization denied." });
    }

    const token = authHeader.split(" ")[1];
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.id) {
            return res.status(401).json({ message: "Invalid token payload." });
        }

        req.user = await User.findById(decoded.id).select("-password");
        if (!req.user) {
            return res.status(404).json({ message: "User not found." });
        }

        next();
    } catch (error) {
        
        res.status(401).json({ message: "Invalid token." });
    }
};

export { protect };
