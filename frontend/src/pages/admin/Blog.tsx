import React, { useState, useEffect } from 'react';
import axios from "axios";

function Blog() {

    const [activeTab, setActiveTab] = useState("create");

    const [formData, setFormData] = useState({
        date: "",
        category: "",
        title: "",
        author: "",
        dis: "",
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(false);

    // 🔹 Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // 🔹 Submit Blog
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedFile) {
            alert("Please select image");
            return;
        }

        const formDataObj = new FormData();

        formDataObj.append("image", selectedFile);
        formDataObj.append("blogdate", formData.date);
        formDataObj.append("blogcategory", formData.category);
        formDataObj.append("blogtitle", formData.title);
        formDataObj.append("authorname", formData.author);
        formDataObj.append("description", formData.dis);

        try {
            const res = await axios.post(
                "http://localhost:5000/blog",
                formDataObj,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            console.log(res.data);

            // reset
            setFormData({
                date: "",
                category: "",
                title: "",
                author: "",
                dis: "",
            });
            setSelectedFile(null);

            alert("Blog Added Successfully ✅");

        } catch (error) {
            console.log(error.response?.data);
        }
    };

    // 🔹 Fetch blogs (FIXED)
    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://localhost:5000/showblog");

            console.log("API RESPONSE:", res.data); // 🔥 debug

            // 🔥 SAFE HANDLING
            if (Array.isArray(res.data)) {
                setBlogs(res.data);
            } else if (Array.isArray(res.data.blogs)) {
                setBlogs(res.data.blogs);
            } else {
                setBlogs([]);
            }

        } catch (error) {
            console.log(error);
            setBlogs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === "view") {
            fetchBlogs();
        }
    }, [activeTab]);

    return (
        <div className='min-h-screen bg-gray-100 p-10'>
            <div className='max-w-5xl mx-auto'>

                {/* Tabs */}
                <div className='flex gap-10 font-semibold text-lg mb-6'>
                    <h1
                        onClick={() => setActiveTab("create")}
                        className={`cursor-pointer ${activeTab === "create" ? "text-blue-600 border-b-2 border-blue-600" : ""}`}
                    >
                        Create Blog
                    </h1>

                    <h1
                        onClick={() => setActiveTab("view")}
                        className={`cursor-pointer ${activeTab === "view" ? "text-blue-600 border-b-2 border-blue-600" : ""}`}
                    >
                        View Blogs
                    </h1>
                </div>

                {/* ================= CREATE ================= */}
                {activeTab === "create" && (
                    <div className='bg-white rounded-2xl shadow-lg p-8'>
                        <form className='space-y-4' onSubmit={handleSubmit}>

                            <input
                                type="file"
                                onChange={(e) => setSelectedFile(e.target.files[0])}
                                className='w-full border p-2 rounded'
                            />

                            <input type="date" name="date" onChange={handleChange} className='w-full border p-2 rounded' />
                            <input type="text" name="category" placeholder="Category" onChange={handleChange} className='w-full border p-2 rounded' />
                            <input type="text" name="title" placeholder="Title" onChange={handleChange} className='w-full border p-2 rounded' />
                            <input type="text" name="author" placeholder="Author" onChange={handleChange} className='w-full border p-2 rounded' />

                            <textarea name="dis" placeholder="Description" onChange={handleChange} className='w-full border p-2 rounded' />

                            <button className='w-full bg-blue-600 text-white py-2 rounded'>
                                Publish Blog
                            </button>
                        </form>
                    </div>
                )}

                {/* ================= VIEW ================= */}
                {activeTab === "view" && (
                    <div>
                        <h1 className="text-2xl font-bold mb-4">All Blogs</h1>

                        {loading ? (
                            <p>Loading...</p>
                        ) : blogs.length === 0 ? (
                            <p>No blogs found</p>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {blogs.map((blog) => (
                                    <div key={blog._id} className="bg-white rounded-xl shadow p-4">

                                        <img src={blog.image} className="h-40 w-full object-cover rounded mb-2" />

                                        <h2 className="font-bold text-lg">{blog.blogtitle}</h2>
                                        <p className="text-sm text-blue-500">{blog.blogcategory}</p>

                                        <p className="text-sm mt-2">{blog.description}</p>

                                        <div className="flex justify-between text-xs mt-3 text-gray-500">
                                            <span>{blog.authorname}</span>
                                            <span>{blog.blogdate}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}

export default Blog;