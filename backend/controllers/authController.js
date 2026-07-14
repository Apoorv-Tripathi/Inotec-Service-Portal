const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate JWT
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || "24h",
    }
  );
};

// ======================
// CUSTOMER REGISTER
// ======================
exports.customerRegister = async (req, res) => {
  try {
    const {
      name,
      companyName,
      city,
      mobileNumber,
      password,
    } = req.body;

    const existing = await User.findOne({ mobileNumber });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Mobile number already registered",
      });
    }

    const user = await User.create({
      role: "customer",
      name,
      companyName,
      city,
      mobileNumber,
      password,
      isVerified: true,
      isActive: true,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

// ======================
// CUSTOMER LOGIN
// ======================
exports.customerLogin = async (req, res) => {
  try {
    const { mobileNumber, password } = req.body;

    const user = await User.findOne({
      mobileNumber,
      role: "support",
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid mobile number or password",
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid mobile number or password",
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

// ======================
// ADMIN LOGIN
// ======================
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email,
      role: { $in: ["admin", "support"] },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};