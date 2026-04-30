import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import userSchema from "./src/user/user.model.js";
import bcrypt from "bcrypt";
import { dbConnect } from "./src/lib/dbConnect.js";
import router from "./src/query/query.route.js";
import paymentRouter from "./src/orders/order.route.js";
import contactRouter from "./src/contacts/contacts.route.js";
import authRoutes from "./src/user/user.route.js";
import cookieParser from "cookie-parser";
import adminRoutes from "./src/admin/admin.route.js";
import bookRouter from "./src/oneTwoOne/book.route.js";
import certificateRouter from "./src/certificate/certificateRoute.js";
import couponRouter from "./src/orders/couponroute.js"
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import fs from "fs";
import blog from "./src/blog/blog.model.js"
// import { image } from "pdfkit";
dotenv.config();
const app = express();
console.log(process.env.JWT_SECRET);
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(cookieParser());
// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL,
//     credentials: true,
//   })
// );
app.use("/api/auth", authRoutes);
app.use("/api", router);
app.use("/api", paymentRouter);
app.use("/api", contactRouter);
app.use("/api", bookRouter);
app.use("/api", certificateRouter);
app.use("/api/admin", adminRoutes);

//coupern route
app.use("/api/discount/", couponRouter)

const PORT = process.env.PORT || 5000;

// blog add

cloudinary.config({
  cloud_name: "dbryakjgn",
  api_key: "136484737967582",
  api_secret: "x6DovvV0EFx0xkKeJSh7umAltDA"
});

const upload = multer({ dest: "uploads/" });

app.post('/blog', upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Image is required" });
    }

    const result = await cloudinary.uploader.upload(req.file.path);

    const { blogdate, blogcategory, blogtitle, authorname, description } = req.body;

    if (!blogtitle || !description) {
      return res.status(400).json({ error: "Title and description required" });
    }

    const addBlog = await blog.create({
      image: result.secure_url,
      blogdate,
      blogcategory,
      blogtitle,
      authorname,
      description,
    });

    fs.unlinkSync(req.file.path);

    res.status(201).json({
      message: "Blog added successfully",
      addBlog
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// show blogs
app.get('/showblog', async (req, res) => {
  try {
    const showBlog = await blog.find().sort({ createdAt: -1 });

    res.status(200).json(showBlog); // ✅ ARRAY bhejo

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
dbConnect().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
