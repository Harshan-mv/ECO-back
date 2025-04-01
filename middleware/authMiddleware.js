import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "No token provided. Authorization denied." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password"); // Attach user info to `req.user`
        next();
    } catch (error) {
        console.error("❌ JWT Verification Error:", error.message);
        res.status(401).json({ message: "Invalid token." });
    }
};

export default protect;
