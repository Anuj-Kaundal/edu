import express from "express";
import {
  checkAuth,
  getAllUser,
  getUser,
  login,
  logout,
  signup,
  updateProfile,
  forgetPassword,
  resetPassword
  //   updateProfile,
} from "./user.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", (req, res) => {
  return res.status(200).json({ home: "ok", message: "this is home route" });
});

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/getUser", protectRoute, getUser);

router.put("/update-profile", protectRoute, updateProfile);

router.get("/check", protectRoute, checkAuth);
router.get("/get-all-users", getAllUser);
router.post("/forget-password", forgetPassword);
router.post("/reset-password", resetPassword);

export default router;
