import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  image: String,
  title: String,
  author: String,
  url: String,
  date:Date,
  excerpt: String,
  metaTitle: String,
  metaDescription:String,
  categories:String,
  description:String
},
  { timestamps: true }
);

export default mongoose.model("Blog", blogSchema);