import React, { useState, useEffect, useRef } from 'react';
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

function Blog() {

    const fileInputRef = useRef(null);

    const [activeTab, setActiveTab] = useState("create");
    const [blogs, setBlogs] = useState([]);
    const [categoryInput, setCategoryInput] = useState("");

    const [formData, setFormData] = useState({
        image: null,
        title: "",
        author: "",
        url: "",
        excerpt: "",
        metaTitle: "",
        metaDescription: "",
        categories: [],
        description: ""
    });

    // ✅ Add category
    const addCategory = () => {
        if (!categoryInput.trim()) return;

        setFormData(prev => ({
            ...prev,
            categories: [...prev.categories, categoryInput]
        }));

        setCategoryInput("");
    };

    // ✅ Handle input
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // ✅ Image change
    const handleImageChange = (e) => {
        const file = e.target.files[0];

        setFormData(prev => ({
            ...prev,
            image: file
        }));
    };

    // ✅ Submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const data = new FormData();

            Object.keys(formData).forEach(key => {
                if (key === "categories") {
                    data.append(key, JSON.stringify(formData.categories));
                } else {
                    data.append(key, formData[key]);
                }
            });

            await axios.post("http://localhost:5000/blog", data, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            alert("Blog Added ✅");

            // reset
            setFormData({
                image: null,
                title: "",
                author: "",
                url: "",
                excerpt: "",
                metaTitle: "",
                metaDescription: "",
                categories: [],
                description: ""
            });

            setCategoryInput("");
            if (fileInputRef.current) fileInputRef.current.value = "";

        } catch (error) {
            console.log(error);
        }
    };

    // fetch
    const fetchBlogs = async () => {
        const res = await axios.get("http://localhost:5000/showblog");
        setBlogs(res.data);
    };

    useEffect(() => {
        if (activeTab === "show") fetchBlogs();
    }, [activeTab]);

    const modules = {
        toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image"],
            ["clean"]
        ]
    };

    return (
        <div className='flex flex-col p-10 w-full'>

            {/* Tabs */}
            <div className='flex gap-10 text-xl font-semibold pb-10'>
                <h1
                    onClick={() => setActiveTab("create")}
                    className={`cursor-pointer ${activeTab === "create" ? "text-blue-600 border-b-2 border-blue-600" : ""}`}
                >
                    Create Blog
                </h1>

                <h1
                    onClick={() => setActiveTab("show")}
                    className={`cursor-pointer ${activeTab === "show" ? "text-blue-600 border-b-2 border-blue-600" : ""}`}
                >
                    Show Blogs
                </h1>
            </div>

            {/* ================= CREATE ================= */}
            {activeTab === "create" && (
                <div className='w-full max-w-4xl bg-gray-200 p-5 rounded-lg shadow-md'>
                    <form className='flex flex-col gap-3' onSubmit={handleSubmit}>

                        {/* 🔥 IMAGE UPLOAD UI */}
                        <div className='border-b border-gray-400 pb-5'>
                            <div className="border-2 border-dashed border-gray-400 rounded-xl p-10 flex flex-col items-center justify-center bg-gray-100">

                                <label className="cursor-pointer flex items-center gap-3">

                                    <span className="bg-white px-4 py-2 border rounded-md shadow-sm">
                                        Choose File
                                    </span>

                                    <span className="text-gray-600">
                                        {formData.image ? formData.image.name : "No file chosen"}
                                    </span>

                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={handleImageChange}
                                        required
                                    />
                                </label>

                                {/* 🔥 Preview */}
                                {formData.image && (
                                    <img
                                        src={URL.createObjectURL(formData.image)}
                                        alt="preview"
                                        className="w-40 mt-4 rounded-lg"
                                    />
                                )}

                            </div>
                        </div>

                        <h1 className='text-lg font-semibold pt-2 pb-2'>Blog Details</h1>

                        <label>Title *</label>
                        <input type="text" name="title" value={formData.title}
                            onChange={handleChange} className='border p-2 rounded-lg' required />

                        <label>Author *</label>
                        <input type="text" name="author" value={formData.author}
                            onChange={handleChange} className='border p-2 rounded-lg' required />

                        <label>Custom URL *</label>
                        <input type="text" name="url" value={formData.url}
                            onChange={handleChange} className='border p-2 rounded-lg' required />

                        <label>Excerpt *</label>
                        <textarea name="excerpt" value={formData.excerpt}
                            onChange={handleChange} className='border p-2 rounded-lg h-20' required />

                        <label>Meta Title</label>
                        <input type="text" name="metaTitle" value={formData.metaTitle}
                            onChange={handleChange} className='border p-2 rounded-lg' />

                        <label>Meta Description</label>
                        <input type="text" name="metaDescription" value={formData.metaDescription}
                            onChange={handleChange} className='border p-2 rounded-lg' />

                        {/* Categories */}
                        <label>Categories</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={categoryInput}
                                onChange={(e) => setCategoryInput(e.target.value)}
                                className="border p-2 rounded-lg w-full"
                            />
                            <button type="button" onClick={addCategory}
                                className="bg-purple-500 text-white px-4 rounded-lg">
                                Add
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2">
                            {formData.categories.map((cat, index) => (
                                <span key={index} className="bg-gray-300 px-3 py-1 rounded-full text-sm">
                                    {cat}
                                </span>
                            ))}
                        </div>

                        {/* Description */}
                        <label>Description *</label>
                        <div className="bg-white rounded-lg">
                            <ReactQuill
                                theme="snow"
                                value={formData.description}
                                onChange={(value) =>
                                    setFormData(prev => ({ ...prev, description: value }))
                                }
                                modules={modules}
                                className="h-80 mb-10"
                            />
                        </div>

                        <button className='bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg'>
                            Submit
                        </button>

                    </form>
                </div>
            )}

            {/* ================= SHOW ================= */}
            {activeTab === "show" && (
                <div className='grid grid-cols-3 gap-5'>

                    {blogs.map((blog) => (
                        <div key={blog._id} className='bg-gray-100 p-3 rounded-lg shadow-md'>

                            <img src={blog.image} className='w-full h-40 object-cover rounded-lg' />

                            <h2 className='font-bold mt-2'>{blog.title}</h2>
                            <p className='text-sm text-gray-600'>{blog.excerpt}</p>

                            <div className='flex flex-wrap gap-1 mt-2'>
                                {(() => {
                                    try {
                                        const categories =
                                            typeof blog.categories === "string"
                                                ? JSON.parse(blog.categories)
                                                : blog.categories;

                                        return Array.isArray(categories)
                                            ? categories.map((cat, i) => (
                                                <span key={i}
                                                    className='bg-gray-300 px-2 py-1 text-xs rounded'>
                                                    {cat}
                                                </span>
                                            ))
                                            : null;
                                    } catch {
                                        return null;
                                    }
                                })()}
                            </div>
                        </div>
                    ))}

                </div>
            )}

        </div>
    );
}

export default Blog;