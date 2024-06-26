const jwt = require("jsonwebtoken");
require("dotenv").config();
const secret_key = process.env.SECRET_KEY;

const authenticateAdmin = async (req, res, next) => {
  const token = req.header("auth-token");

  if (!token) {
    return res.status(401).json({ error: "Enter a token to authenticate" });
  }
  try {
    const data = jwt.verify(token, secret_key);

    if (data.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Not permitted to perform this action" });
    }
    req.user = data.user;
    next();
  } catch {
    res.status(401).json({ error: "Enter a valid token to authenticate" });
  }
};

module.exports = authenticateAdmin;
