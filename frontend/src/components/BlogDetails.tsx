import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Footer from "./Footer";

const BlogDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);

    useEffect(() => {
        axios
            .get(`http://localhost:5000/blog/${id}`)
            .then((res) => setBlog(res.data))
            .catch(() => console.log("Error fetching blog"));
    }, [id]);

    if (!blog)
        return (
            <div className="flex justify-center items-center h-screen text-gray-500 text-lg">
                Loading...
            </div>
        );

    // ✅ Safe categories parsing
    let categories = [];
    try {
        if (typeof blog.categories === "string") {
            categories = JSON.parse(blog.categories);
        } else if (Array.isArray(blog.categories)) {
            categories = blog.categories;
        }
    } catch (err) {
        categories = blog.categories?.split(",").map(c => c.trim()) || [];
    }

    return (
        <>
            <div className="bg-gray-100 min-h-screen py-10 px-4">
                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden mt-20">

                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="text-blue-600 text-sm px-6 pt-6 font-semibold hover:underline"
                    >
                        ← Back to blog
                    </button>

                    {/* Image (same style as news/event) */}
                    <div className="flex justify-center mt-5">
                        <img
                            src={blog.image}
                            alt=""
                            className="w-fit h-72 object-cover rounded-lg"
                        />
                    </div>

                    {/* Content */}
                    <div className="px-6 md:px-10 py-8">

                        {/* Meta */}
                        <div className="flex justify-between text-sm text-gray-900 mb-4">
                            <span className="font-medium text-gray-700">
                                {blog.author || "Admin"}
                            </span>
                            <span>
                                {blog.createdAt
                                    ? new Date(blog.createdAt).toDateString()
                                    : ""}
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                            {blog.title}
                        </h1>

                        {/* Excerpt */}
                        <p className="text-gray-600 mb-5">
                            {blog.excerpt}
                        </p>

                        {/* Categories */}
                        <div className="flex flex-wrap gap-2 mb-5">
                            {categories.map((cat, index) => (
                                <span
                                    key={index}
                                    className="text-white bg-purple-500 px-3 py-1 text-xs rounded-xl"
                                >
                                    {cat}
                                </span>
                            ))}
                        </div>

                        {/* Content */}
                        <div
                            className="prose max-w-none mt-5 space-y-5"
                            dangerouslySetInnerHTML={{
                                __html: blog.description || blog.content,
                            }}
                        ></div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
};

export default BlogDetails;