import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

function Blog() {
    const editorConfiguration = {
        toolbar: {
            items: [
                'heading',
                '|',
                'bold', 'italic', 'underline', 'strikethrough',
                '|',
                'bulletedList', 'numberedList', 'todoList',
                '|',
                // TEXT COLOR & BACKGROUND COLOR BUTTONS
                'fontColor', 'fontBackgroundColor',
                'insertTable',
                'uploadImage',
                'mediaEmbed',
                'outdent', 'indent',
                '|',
                'link', 'insertTable', 'blockQuote', 'undo', 'redo'
            ],
            link: {
                addTargetToExternalLinks: true,
                defaultProtocol: 'https://'
            }
        },
        heading: {
            options: [
                { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
                { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
                { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
                { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
                { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
                { model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' }
            ]
        }
    };
    const [activeTab, setActiveTab] = useState("create");
    const [expandedId, setExpandedId] = useState(null);
    const [editId, setEditId] = useState(null);

    const fileInputRef = useRef(null);
    const formRef = useRef(null);

    const [blogs, setBlogs] = useState([]);
    const [categoryInput, setCategoryInput] = useState("");
    const [preview, setPreview] = useState("");

    const [editorKey, setEditorKey] = useState(0);

    const initialState = {
        image: null,
        title: "",
        author: "",
        url: "",
        date: "",
        excerpt: "",
        metaTitle: "",
        metaDescription: "",
        categories: [],
        description: ""
    };

    const [formData, setFormData] = useState(initialState);

    // ADD CATEGORY
    const addCategory = () => {

        const trimmed = categoryInput.trim();

        if (!trimmed) return;

        // prevent duplicate category
        if (formData.categories.includes(trimmed)) {

            alert("Category already added");

            return;
        }

        setFormData((prev) => ({
            ...prev,
            categories: [...prev.categories, trimmed]
        }));

        setCategoryInput("");
    };
      // CONTENT CHANGE (FIXED)
    const handleContentChange = (event, editor) => {
        const data = editor.getData();
        setFormData((prev) => ({
            ...prev,
            description: data
        }));
    };

    // REMOVE CATEGORY
    const removeCategory = (index) => {

        setFormData((prev) => ({
            ...prev,
            categories: prev.categories.filter((_, i) => i !== index)
        }));
    };

    // HANDLE INPUT
    const handleChange = (e) => {

        const { name, value } = e.target;

        // AUTO GENERATE URL FROM TITLE
        if (name === "title") {

            const slug = value
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-");

            setFormData((prev) => ({
                ...prev,
                title: value,
                url: slug
            }));

        } else {

            setFormData((prev) => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // IMAGE CHANGE
    const handleImageChange = (e) => {

        const file = e.target.files[0];

        if (!file) return;

        const maxSize = 5 * 1024 * 1024;

        const allowedTypes = [
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/webp",
            "image/gif"
        ];

        // FILE TYPE VALIDATION
        if (!allowedTypes.includes(file.type)) {

            alert("Only PNG, JPG, WEBP or GIF allowed");

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            return;
        }

        // FILE SIZE VALIDATION
        if (file.size > maxSize) {

            alert("File size must be less than 5MB");

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            return;
        }

        const img = new Image();

        const objectUrl = URL.createObjectURL(file);

        img.src = objectUrl;

        img.onload = () => {

            const requiredWidth = 1920;
            const requiredHeight = 600;

            // IMAGE DIMENSION VALIDATION
            if (
                img.width !== requiredWidth ||
                img.height !== requiredHeight
            ) {

                alert(
                    `Please upload image size ${requiredWidth}x${requiredHeight}px`
                );

                URL.revokeObjectURL(objectUrl);

                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }

                return;
            }

            setPreview(objectUrl);

            setFormData((prev) => ({
                ...prev,
                image: file
            }));
        };
    };

    // FETCH BLOGS
    const fetchBlogs = async () => {

        try {

            const res = await axios.get(
                "http://localhost:5000/showblog"
            );

            setBlogs(res.data);

        } catch (error) {

            console.log(error);
        }
    };

    useEffect(() => {

        if (activeTab === "show") {

            fetchBlogs();
        }

    }, [activeTab]);

    // EDIT BLOG
    const editBlog = (blog) => {

        setActiveTab("create");

        setEditId(blog._id);

        setFormData({
            image: null,
            title: blog.title || "",
            author: blog.author || "",
            url: blog.url || "",
            date: blog.date
                ? blog.date.split("T")[0]
                : "",
            excerpt: blog.excerpt || "",
            metaTitle: blog.metaTitle || "",
            metaDescription: blog.metaDescription || "",
            categories:
                typeof blog.categories === "string"
                    ? JSON.parse(blog.categories)
                    : blog.categories || [],
            description: blog.description || ""
        });

        setPreview(blog.image);
    };

    // SUBMIT
    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const data = new FormData();

            Object.keys(formData).forEach((key) => {

                if (key === "categories") {

                    data.append(
                        key,
                        JSON.stringify(formData.categories)
                    );

                } else {

                    data.append(key, formData[key]);
                }
            });

            // UPDATE BLOG
            if (editId) {

                await axios.put(
                    `http://localhost:5000/updateblog/${editId}`,
                    data,
                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data"
                        }
                    }
                );

                alert("Blog Updated ✅");

            } else {

                // CREATE BLOG
                await axios.post(
                    "http://localhost:5000/blog",
                    data,
                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data"
                        }
                    }
                );

                alert("Blog Added ✅");
            }

            // RESET
            setEditId(null);

            setFormData(initialState);

            setCategoryInput("");

            setPreview("");

            // RESET FORM
            formRef.current.reset();

            // RESET FILE INPUT
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            // RESET QUILL
            setEditorKey((prev) => prev + 1);

            fetchBlogs();

        } catch (error) {

            console.log(error);
        }
    };

    // DELETE BLOG
    const deleteblog = async (id) => {

        try {

            const deleteBlog = await axios.delete(
                `http://localhost:5000/deleteblog/${id}`
            );

            if (deleteBlog) {

                alert("Blog Deleted ✅");

                fetchBlogs();

            } else {

                alert("Something wrong");
            }

        } catch (error) {

            console.log(error);

            alert("Delete failed");
        }
    };

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

        <div className="flex flex-col items-center p-10 w-full">

            {/* TABS */}
            <div className="flex justify-start w-full max-w-4xl gap-10 text-xl font-semibold pb-10">

                <h1
                    onClick={() => setActiveTab("create")}
                    className={`cursor-pointer ${activeTab === "create"
                            ? "text-blue-600 border-b-2 border-blue-600"
                            : ""
                        }`}
                >
                    Create Blog
                </h1>

                <h1
                    onClick={() => setActiveTab("show")}
                    className={`cursor-pointer ${activeTab === "show"
                            ? "text-blue-600 border-b-2 border-blue-600"
                            : ""
                        }`}
                >
                    Show Blogs
                </h1>
            </div>

            {/* CREATE BLOG */}
            {activeTab === "create" && (

                <div className="w-full max-w-4xl p-5 rounded-lg shadow-md">

                    <form
                        ref={formRef}
                        className="flex flex-col gap-3"
                        onSubmit={handleSubmit}
                    >

                        {/* IMAGE */}
                        <div className="border-b border-gray-400 pb-5">

                            <div className="border-2 border-dashed border-gray-400 rounded-xl p-10 flex flex-col items-center justify-center bg-gray-100">

                                <label className="cursor-pointer flex items-center gap-3">

                                    <span className="bg-white px-4 py-2 border rounded-md shadow-sm">
                                        Choose File
                                    </span>

                                    <span className="text-gray-600">
                                        {formData.image
                                            ? formData.image.name
                                            : "No file chosen"}
                                    </span>

                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </label>

                                {/* PREVIEW */}
                                {preview && (
                                    <img
                                        src={preview}
                                        alt="Blog preview"
                                        className="w-full h-72 object-cover mt-4 rounded-lg"
                                    />
                                )}

                                <span className="text-sm text-gray-600 mt-3">
                                    PNG , JPG , WEBP or GIF (max.5MB)
                                </span>
                            </div>

                            <p className="text-sm text-gray-500 mt-2">
                                Recommended banner size: 1920 × 600 px
                            </p>
                        </div>

                        <h1 className="text-lg font-semibold pt-2 pb-2">
                            Blog Details
                        </h1>

                        {/* TITLE */}
                        <label>Title *</label>

                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="border p-2 rounded-lg"
                            required
                        />

                        {/* AUTHOR */}
                        <label>Author *</label>

                        <input
                            type="text"
                            name="author"
                            value={formData.author}
                            onChange={handleChange}
                            className="border p-2 rounded-lg"
                            required
                        />

                        {/* URL */}
                        <label>Custom URL *</label>

                        <input
                            type="text"
                            name="url"
                            value={formData.url}
                            readOnly
                            className="border p-2 rounded-lg bg-gray-100"
                        />

                        {/* DATE */}
                        <label>Date *</label>

                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            className="border p-2 rounded-lg"
                            required
                        />

                        {/* EXCERPT */}
                        <label>Excerpt *</label>

                        <textarea
                            name="excerpt"
                            value={formData.excerpt}
                            onChange={handleChange}
                            className="border p-2 rounded-lg h-20"
                            required
                        />

                        {/* META TITLE */}
                        <label>Meta Title</label>

                        <input
                            type="text"
                            name="metaTitle"
                            value={formData.metaTitle}
                            onChange={handleChange}
                            className="border p-2 rounded-lg"
                        />

                        {/* META DESCRIPTION */}
                        <label>Meta Description</label>

                        <input
                            type="text"
                            name="metaDescription"
                            value={formData.metaDescription}
                            onChange={handleChange}
                            className="border p-2 rounded-lg"
                        />

                        {/* CATEGORY */}
                        <label>Categories</label>

                        <div className="flex gap-2">

                            <input
                                type="text"
                                value={categoryInput}
                                onChange={(e) =>
                                    setCategoryInput(e.target.value)
                                }
                                className="border p-2 rounded-lg w-full"
                            />

                            <button
                                type="button"
                                onClick={addCategory}
                                className="bg-purple-500 text-white px-4 rounded-lg"
                            >
                                Add
                            </button>
                        </div>

                        {/* CATEGORY LIST */}
                        <div className="flex flex-wrap gap-2 mt-2">

                            {formData.categories.map((cat, index) => (
                                <span
                                    key={index}
                                    onClick={() =>
                                        removeCategory(index)
                                    }
                                    className="bg-gray-300 px-3 py-1 rounded-full text-sm cursor-pointer"
                                >
                                    {cat} ❌
                                </span>
                            ))}
                        </div>

                        {/* DESCRIPTION */}
                        <label>Description *</label>

                        <div className="bg-white rounded-lg">

                            <CKEditor
                                key={editorKey} // Reset key jab submit ho
                                editor={ClassicEditor}
                                data={formData.description}
                                onReady={editor => {
                                    // HEADING SHORTCUTS
                                    const levels = [1, 2, 3, 4, 5, 6];
                                    levels.forEach(level => {
                                        editor.keystrokes.set(`Ctrl+Alt+${level}`, (data, stop) => {
                                            editor.execute('heading', { value: `heading${level}` });
                                            stop();
                                        });
                                    });
                                }}
                                config={editorConfiguration}
                                onChange={handleContentChange}
                            />
                        </div>

                        {/* SUBMIT */}
                        <button className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg">

                            {editId
                                ? "Update Blog"
                                : "Submit"}
                        </button>

                    </form>
                </div>
            )}

            {/* SHOW BLOGS */}
            {activeTab === "show" && (

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">

                    {blogs.length === 0 ? (

                        <p>No Blogs Found</p>

                    ) : (

                        blogs.map((blog) => (

                            <div
                                key={blog._id}
                                className="bg-gray-100 p-3 rounded-lg shadow-md"
                            >

                                {/* IMAGE */}
                                <img
                                    src={blog.image}
                                    alt={blog.title}
                                    className="w-full h-40 object-cover rounded-lg"
                                />

                                {/* TITLE */}
                                <div className="flex justify-between items-center mt-2">

                                    <div>
                                        <h2 className="font-bold mt-2">
                                            {blog.title}
                                        </h2>
                                    </div>

                                    <div className="flex gap-3">

                                        <button
                                            className="bg-green-500 text-white px-2 py-1 text-sm rounded-lg"
                                            onClick={() =>
                                                editBlog(blog)
                                            }
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="bg-red-500 text-white px-2 py-1 text-sm rounded-lg"
                                            onClick={() =>
                                                deleteblog(blog._id)
                                            }
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                {/* DATE */}
                                <p className="text-xs mt-2 text-gray-500">
                                    {blog.date
                                        ? new Date(
                                            blog.date
                                        ).toLocaleDateString()
                                        : "No Date"}
                                </p>

                                {/* EXCERPT */}
                                <div>

                                    <p
                                        className={`text-sm text-gray-600 ${expandedId === blog._id
                                                ? ""
                                                : "line-clamp-3"
                                            }`}
                                    >
                                        {blog.excerpt}
                                    </p>

                                    {blog.excerpt?.length > 120 && (
                                        <button
                                            onClick={() =>
                                                setExpandedId(
                                                    expandedId === blog._id
                                                        ? null
                                                        : blog._id
                                                )
                                            }
                                            className="text-blue-500 text-sm mt-1"
                                        >
                                            {expandedId === blog._id
                                                ? "View Less"
                                                : "View More"}
                                        </button>
                                    )}
                                </div>

                                {/* CATEGORIES */}
                                <div className="flex flex-wrap gap-1 mt-2">

                                    {(() => {

                                        try {

                                            const categories =
                                                typeof blog.categories ===
                                                    "string"
                                                    ? JSON.parse(
                                                        blog.categories
                                                    )
                                                    : blog.categories;

                                            return Array.isArray(categories)
                                                ? categories.map(
                                                    (cat, i) => (
                                                        <span
                                                            key={i}
                                                            className="bg-gray-300 px-2 py-1 text-xs rounded"
                                                        >
                                                            {cat}
                                                        </span>
                                                    )
                                                )
                                                : null;

                                        } catch {

                                            return null;
                                        }
                                    })()}
                                </div>

                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default Blog;