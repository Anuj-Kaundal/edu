import mongoose from "mongoose";

const newsSchema = new mongoose.Schema({
  image: String,
  title: String,
  url: String,
  description:String,
  author: String,
  categories:String,
  date:String,
  tags:String,
  content:String
});

export default mongoose.model("News", newsSchema);