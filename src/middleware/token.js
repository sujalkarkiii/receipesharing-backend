import jwt from "jsonwebtoken";

const handleprotection =  (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Failed to authenticate" });
    }

    const validate = jwt.verify(token, process.env.JWT_SECRET);
    req.user = validate;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default handleprotection;
