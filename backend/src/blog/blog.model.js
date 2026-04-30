import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  image: String,
  blogdate: String,
  blogcategory: String,
  blogtitle: String,
  authorname: String,
  description: String,
}, { timestamps: true });

export default mongoose.model("Blog", blogSchema);