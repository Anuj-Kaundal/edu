import mongoose from "mongoose";

const internshipSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  domain: String,
  duration: String,
  courses: String
});

export default mongoose.model("internship", internshipSchema);