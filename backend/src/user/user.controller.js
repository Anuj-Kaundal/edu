import { generateToken } from "../lib/generateToken.js";
import User from "./user.model.js";
import bcrypt from "bcryptjs";
import userSchema from "./user.model.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
export const signup = async (req, res) => {
  const { firstName, lastName, email, phone, password } = req.body;
  try {
    if ((!firstName, !lastName || !email || !phone || !password)) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }
    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
    });
    if (newUser) {
      // generate jwt token here
      generateToken(newUser._id, res);
      await newUser.save();
      res.status(201).json({
        success: true,
        _id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phone: newUser.phone,
        // profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// export const login = async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ success: false, message: "no user found" });
//     }

//     const isPasswordCorrect = await bcrypt.compare(password, user.password);
//     if (!isPasswordCorrect) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid credentials" });
//     }

//     generateToken(user._id, res);
//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: false, // Localhost ke liye false
//       sameSite: "lax", // Browser blocks 'none' on localhost
//       maxAge: 7 * 24 * 60 * 60 * 1000, // 7 din
//     });
//     res.status(200).json({
//       success: true,
//       _id: user._id,
//       fullName: user.fullName,
//       email: user.email,
//       phone: user.phone,
//       profilePic: user.profilePic,
//     });
//   } catch (error) {
//     console.log("Error in login controller", error.message);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "no user found" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    // 1. Token generate karein aur variable mein store karein
    // Note: Agar generateToken khud cookie set karta hai, toh niche wali res.cookie line hatayein
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // 2. Cookie set karein
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Production mein true, dev mein false
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 3. Response bhejien (Ek hi baar res.json hona chahiye)
    return res.status(200).json({
      success: true,
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      profilePic: user.profilePic,
    });

  } catch (error) {
    console.log("Error in login controller", error.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/////////////////////////////////////get user profile/////////////////////////////////////
// export const getUser = async (req, res) => {
//   try {
//     res.status(200).json({ ...req.user, isAuthenticated: true });
//   } catch (error) {
//     console.log("Error in checkAuth controller", error.message);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("enrollments.item")
      .exec();
    res.status(200).json({ ...user.toObject(), isAuthenticated: true });
  } catch (error) {
    console.log("Error in getUser controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllUser = async (req, res) => {
  try {
    const user = await User.find().sort({ createdAt: -1 });
    // console.log("all users: ", user);
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getAllUser controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
/////////////////////////////////////get user profile/////////////////////////////////////

export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber } = req.body;
    const userId = req.user._id;

    if (!firstName || !lastName || !email || !phoneNumber) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, email, phoneNumber: phoneNumber || "" },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json({ ...req.user, isAuthenticated: true });
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// forget password route
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const forgetPassword = async (req, res) => {
  console.log("API HIT ✅");

  const { email } = req.body;

  try {
    const user = await userSchema.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const secret = process.env.JWT_SECRET + user.password;

    const token = jwt.sign(
      { email: user.email, id: user._id },
      secret,
      { expiresIn: '5m' } // thoda increase kar diya
    );

    const link = `${process.env.FRONTEND_URL}/reset-password/${user._id}/${token}`;
    // ✅ EMAIL SEND KARNA
    await transporter.sendMail({
      to: email,
      subject: "Reset Your Password",
      html: `
        <h3>Password Reset</h3>
        <p>Click below to reset your password:</p>
        <a href="${link}">
          <button style="padding:10px;background:black;color:white;cursor:pointer">
            Reset Password
          </button>
        </a>
      `,
    });

    res.json({ message: "Reset email sent successfully" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// reset password
export const resetPassword = async (req, res) => {
  console.log("RESET API HIT ✅");

  const { id, token } = req.params;
  const { password } = req.body;

  try {
    // 🔍 Find user
    const user = await userSchema.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found ❌" });
    }

    // 🔐 Verify token
    const secret = process.env.JWT_SECRET + user.password;
    jwt.verify(token, secret);

    // 🔐 Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 👉 Update password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      message: "Password updated successfully ✅",
    });

  } catch (error) {
    console.log("ERROR ❌:", error.message);
    return res.status(400).json({
      message: "Invalid or expired token ❌",
    });
  }
};

// 🔗 ROUTE (IMPORTANT)
// blog add