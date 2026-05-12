import mongoose from "mongoose";

const newsSchema = new mongoose.Schema({
  image: String,
  title: String,
  url: String,
  description:String,
  organizer: String,
  categories:String,
  date:String,
  time:String,
  venue:String,
  tags:String,
  content:String
});

export default mongoose.model("Event", newsSchema);