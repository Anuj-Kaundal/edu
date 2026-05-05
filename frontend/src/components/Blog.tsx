import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, Calendar, MoveUpRight } from "lucide-react";
import Footer from "./Footer";

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
    const [blogs, setBlogs] = useState<BlogType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState<string>("");

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const res = await axios.get("http://localhost:5000/showblog");
                setBlogs(res.data);
            } catch (err) {
                setError("Failed to fetch blogs.");
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    const filteredBlogs = blogs.filter((blog) =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Dynamic Tag Colors for professional look
    const tagColors = [
        "bg-purple-100 text-purple-600",
        "bg-blue-100 text-blue-600",
        "bg-green-100 text-green-600",
        "bg-pink-100 text-pink-600",
        "bg-orange-100 text-orange-600"
    ];

    if (loading) return <div className="text-center py-20 font-sans text-gray-500">Loading Article Library...</div>;

    return (
        <>
            <div className="min-h-screen bg-[#F9FBFF] font-sans pb-20">
                {/* Header Section */}
                <header className="pt-16 pb-12 px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] mt-20 mb-4">Our Blog</h1>
                    <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto mb-10">
                        Insights, guides, and expert opinions on technology, business, and more.
                    </p>

                    {/* Search Bar - Image Match */}
                    <div className="relative max-w-2xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search articles..."
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm bg-white"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </header>

                {/* Blog Grid - 2 Columns (Image: image_002565.png) */}
                <main className="max-w-6xl mx-auto px-6 grid gap-10 md:grid-cols-2">
                    {filteredBlogs.map((blog) => {
                        const categories = typeof blog.categories === "string" ? JSON.parse(blog.categories) : blog.categories || [];

                        return (
                            <div key={blog._id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-400 flex flex-col group">
                                {/* Card Image */}
                                <div className="relative h-60 overflow-hidden">
                                    <img
                                        src={blog.image}
                                        alt={blog.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                </div>

                                {/* Card Content */}
                                <div className="p-8 flex flex-col flex-grow">
                                    {/* Date */}
                                    <div className="flex items-center text-gray-400 text-xs font-medium mb-3 uppercase tracking-wider">
                                        <Calendar className="w-4 h-4 mr-1.5" />
                                        {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('en-GB', {
                                            day: '2-digit', month: 'long', year: 'numeric'
                                        }) : "05 May 2026"}
                                    </div>

                                    {/* Title & Icon */}
                                    <div className="flex justify-between items-start mb-2 group-hover:text-blue-600 transition-colors cursor-pointer">
                                        <h2 className="text-xl font-bold text-[#1E293B] leading-snug pr-4">
                                            {blog.title}
                                        </h2>
                                        <MoveUpRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 transition-colors shrink-0" />
                                    </div>

                                    {/* Author */}
                                    <p className="text-sm text-gray-400 mb-4 font-medium">
                                        By {blog.author || "Raj | Novanectar Team"}
                                    </p>

                                    {/* Excerpt */}
                                    <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">
                                        {blog.excerpt}
                                    </p>

                                    {/* Tags/Categories */}
                                    <div className="flex flex-wrap gap-2 mt-auto">
                                        {categories.map((cat: string, index: number) => (
                                            <span
                                                key={index}
                                                className={`${tagColors[index % tagColors.length]} px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-tight`}
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

                {/* Empty State */}
                {filteredBlogs.length === 0 && (
                    <div className="text-center mt-20 text-gray-400 italic">
                        No articles found for "{searchTerm}"
                    </div>
                )}
            </div>
            <Footer/>
        </>
    );
};

export default Blog;