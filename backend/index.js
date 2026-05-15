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
import news from "./src/news/news.model.js"
import event from "./src/event/event.model.js"
// import { image } from "pdfkit";
import userRoutes from "./src/user/user.route.js"
import internshipSchema from "./src/internship/internship.js"
dotenv.config();
const app = express();
app.use(cookieParser());
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

// add blogs
app.post('/blog', upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Image is required" });
    }

    const result = await cloudinary.uploader.upload(req.file.path);

    const { image, title, author, url, excerpt, metaTitle, metaDescription, categories, description } = req.body;

    if (!title || !author) {
      return res.status(400).json({ error: "Title and description required" });
    }

    const addBlog = await blog.create({
      image: result.secure_url,
      title,
      author,
      url,
      excerpt,
      metaTitle,
      metaDescription,
      categories,
      description
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

// add news
app.post('/news', upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Image is required" });
    }

    const result = await cloudinary.uploader.upload(req.file.path);

    const { image, title, author, url, date, tags, content, categories, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: "Title and description required" });
    }

    const addNews = await news.create({
      image: result.secure_url,
      title,
      url,
      description,
      author,
      categories,
      date,
      tags,
      content
    });

    fs.unlinkSync(req.file.path);

    res.status(201).json({
      message: "News added successfully",
      addNews
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// show news
app.get('/shownew', async (req, res) => {
  try {
    const showNews = await news.find().sort({ createdAt: -1 });

    res.status(200).json(showNews); // ✅ ARRAY bhejo

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//add event
app.post('/event', upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Image is required" });
    }

    const result = await cloudinary.uploader.upload(req.file.path);

    const { image, title, organizer, url, date, time, venue, content, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: "Title and description required" });
    }

    const addEvent = await event.create({
      image: result.secure_url,
      title,
      url,
      description,
      organizer,
      // categories,
      date,
      time,
      venue,
      // tags,
      content
    });

    fs.unlinkSync(req.file.path);

    res.status(201).json({
      message: "Event added successfully",
      addEvent
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// show event
app.get('/showevent', async (req, res) => {
  try {
    const showEvent = await event.find().sort({ createdAt: -1 });

    res.status(200).json(showEvent); // ✅ ARRAY bhejo

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// change password

app.post("/api/change-password", async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "You have to Login First" });
    }

    // 1. Verify Token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Session expire" });
    }

    // 2. Body se data nikalein
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 3. Find User
    const user = await userSchema.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: " No User Found" });
    }

    // 4. Current Password Compare karein
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current Password is not match" });
    }

    // 5. New Password Hash karein
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 6. Update aur Save
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password Change successfully ✅" });

  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// blog details show
app.get("/blog/:id", async (req, res) => {
  const blogDetails = await blog.findById(req.params.id);
  res.json(blogDetails);
});
// fetch all blog
app.get("/blog", async (req, res) => {
  try {
    const allBlog = await blog.find(); // .find() bina ID ke saara data nikaalta hai
    res.json(allBlog);
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching all news" });
  }
});

// news details show
app.get("/news/:id", async (req, res) => {
  const newsDetails = await news.findById(req.params.id);
  res.json(newsDetails);
});

// 1. Saari news fetch karne ka route
app.get("/news", async (req, res) => {
  try {
    const allNews = await news.find(); // .find() bina ID ke saara data nikaalta hai
    res.json(allNews);
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching all news" });
  }
});

// fetch all event
app.get("/event", async (req, res) => {
  try {
    const allEvent = await event.find(); // .find() bina ID ke saara data nikaalta hai
    res.json(allEvent);
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching all news" });
  }
});

// 2. Single news ka route (Jo aapne pehle se likha hai)
app.get("/news/:id", async (req, res) => {
  try {
    const newsDetails = await news.findById(req.params.id);
    res.json(newsDetails);
  } catch (error) {
    res.status(404).json({ message: "News not found" });
  }
});

// event details show
app.get("/events/:id", async (req, res) => {
  const eventDetails = await event.findById(req.params.id);
  res.json(eventDetails);
});

// fetch all event
app.get("/event", async (req, res) => {
  try {
    const allEvent = await event.find(); // .find() bina ID ke saara data nikaalta hai
    res.json(allEvent);
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching all news" });
  }
});

// delete blog
app.delete('/deleteblog/:id', async (req, res) => {
  const blogDelete = await blog.findByIdAndDelete(req.params.id);
  res.json(blogDelete);
});

// update blog
app.put('/updateblog/:id', upload.single("image"), async (req, res) => {

  try {

    const updatedData = {
      title: req.body.title,
      author: req.body.author,
      url: req.body.url,
      date: req.body.date,
      excerpt: req.body.excerpt,
      metaTitle: req.body.metaTitle,
      metaDescription: req.body.metaDescription,
      categories: req.body.categories,
      description: req.body.description
    };

    // if new image uploaded
    if (req.file) {

      updatedData.image =
        `http://localhost:5000/uploads/${req.file.filename}`;
    }

    const blogUpdate =
      await blog.findByIdAndUpdate(
        req.params.id,
        updatedData,
        { new: true }
      );

    res.json(blogUpdate);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });
  }
}
);

// delete news
app.delete('/deletenews/:id', async (req, res) => {
  const newsDelete = await news.findByIdAndDelete(req.params.id);
  res.json(newsDelete);
});

// update news
app.put('/updatenews/:id', upload.single("image"), async (req, res) => {

  try {

    const updateData = {
      title: req.body.title,
      url: req.body.url,
      description: req.body.description,
      author: req.body.author,
      categories: req.body.categories,
      date: req.body.date,
      tags: req.body.tags,
      content: req.body.content,
    };

    // AGAR NEW IMAGE AAYE TABHI UPDATE KARO
    if (req.file) {
      updateData.image = req.file.path;
    }

    const updatedNews = await news.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updatedNews);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "Update failed"
    });

  }

});

// delete event
app.delete('/deleteevent/:id', async (req, res) => {
  const eventDelete = await event.findByIdAndDelete(req.params.id);
  res.json(eventDelete);
});

// update event
app.put(
  '/updateevent/:id',
  upload.single("image"),
  async (req, res) => {

    try {

      const updateData = {
        title: req.body.title,
        url: req.body.url,
        description: req.body.description,
        author: req.body.author,
        categories: req.body.categories,
        date: req.body.date,
        tags: req.body.tags,
        content: req.body.content,
      };

      // IMAGE OPTIONAL
      if (req.file) {
        updateData.image = req.file.path;
      }

      const updatedEvent = await event.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      res.json(updatedEvent);

    } catch (error) {

      console.log(error);

      res.status(500).json({
        error: "Update failed"
      });

    }

  });

  // internship data

  app.post('/internship', async (req, res) => {
    const { name, email, phone, domain, duration, courses } = req.body;

    if (!name || !email || !phone) {
        return res.status(400).json({ error: "Name, Email, and Phone are required fields" });
    }

    try {
        // Schema mein naye fields add karein
        const add_Internship = await internshipSchema.create({
            name,
            email,
            phone,
            domain,
            duration,
            courses
        });

        // Success response
        res.status(200).send(add_Internship);
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 🔥 IMPORTANT
app.use("/", userRoutes);

dbConnect().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
