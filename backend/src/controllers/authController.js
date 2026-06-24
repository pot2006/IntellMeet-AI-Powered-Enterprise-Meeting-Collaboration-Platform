import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const registerUser = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        message: "Request body missing",
      });
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }
    const normalizedEmail = email.toLowerCase();

    const exists = await User.findOne({
      email: normalizedEmail,
    });

    if (exists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
    });
    return res.status(201).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email,
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      return res.json({
        token: generateToken(user._id),

        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    }

    res.status(401).json({
      message: "Invalid credentials",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getMe = async (req, res) => {
  // FIX: req.user (attached by the protect middleware) is the full
  // Mongoose document, which includes the hashed password field. The
  // hash being leaked to the frontend isn't an immediately exploitable
  // bug (it's bcrypt-hashed, not plaintext), but there's no reason for
  // the client to ever receive it, so it's worth trimming here rather
  // than leaving it as a habit that could bite harder if a less-safe
  // field gets added to User later.
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    avatar: req.user.avatar,
  });
};

// ---- Update profile (name, avatar). Email is intentionally NOT
// editable here — it's the account's unique identifier and used for
// login, so changing it needs its own dedicated, more careful flow
// (e.g. re-verification) rather than being lumped in with a casual
// "Save Changes" button. Role is also not user-editable — it's an
// account property, not a self-reported job title. ----
export const updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;

    if (name !== undefined && !name.trim()) {
      return res.status(400).json({ message: "Name cannot be empty" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name !== undefined) user.name = name.trim();
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
