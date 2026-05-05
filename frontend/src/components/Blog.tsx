import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, Calendar, MoveUpRight } from "lucide-react";
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";

type BlogType = {
  _id: string;
  title: string;
  excerpt: string;
  image: string;
  categories: string[] | string;
  createdAt?: string;
  author?: string;
};

const Blog: React.FC = () => {
  const navigate = useNavigate(); // ✅ FIXED (inside component)

  const [blogs, setBlogs] = useState<BlogType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axios.get("http://localhost:5000/showblog");
        setBlogs(res.data);
      } catch (err) {
        console.log("Error fetching blogs");
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const filteredBlogs = blogs.filter((blog) =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tagColors = [
    "bg-purple-100 text-purple-600",
    "bg-blue-100 text-blue-600",
    "bg-green-100 text-green-600",
    "bg-pink-100 text-pink-600",
    "bg-orange-100 text-orange-600",
  ];

  if (loading)
    return (
      <div className="text-center py-20 text-gray-500">
        Loading Article Library...
      </div>
    );

  return (
    <>
      <div className="min-h-screen bg-[#F9FBFF] pb-20">
        {/* Header */}
        <header className="pt-16 pb-12 text-center">
          <h1 className="text-4xl font-bold mt-20 mb-4">Our Blog</h1>

          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search articles..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {/* Blog Grid */}
        <main className="max-w-6xl mx-auto px-6 grid gap-10 md:grid-cols-2">
          {filteredBlogs.map((blog) => {
            const categories =
              typeof blog.categories === "string"
                ? JSON.parse(blog.categories)
                : blog.categories || [];

            return (
              <div
                key={blog._id}
                onClick={() => navigate(`/blogdetails/${blog._id}`)} // ✅ FIXED (dynamic id)
                className="bg-white rounded-lg shadow-sm hover:shadow-xl transition cursor-pointer border flex flex-col group"
              >
                {/* Image */}
                <div className="h-60 overflow-hidden">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-fill group-hover:scale-105 transition"
                  />
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  {/* Date */}
                  <div className="flex items-center text-gray-400 text-xs mb-3">
                    <Calendar className="w-4 h-4 mr-1" />
                    {blog.createdAt
                      ? new Date(blog.createdAt).toDateString()
                      : "05 May 2026"}
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold mb-2">
                    {blog.title}
                  </h2>

                  {/* Author */}
                  <p className="text-sm text-gray-400 mb-3">
                    By {blog.author || "Admin"}
                  </p>

                  {/* Excerpt */}
                  <p className="text-gray-500 text-sm mb-4">
                    {blog.excerpt}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {categories.map((cat: string, index: number) => (
                      <span
                        key={index}
                        className={`${
                          tagColors[index % tagColors.length]
                        } px-3 py-1 rounded-full text-xs`}
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </main>

        {/* Empty */}
        {filteredBlogs.length === 0 && (
          <div className="text-center mt-20 text-gray-400">
            No articles found
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default Blog;