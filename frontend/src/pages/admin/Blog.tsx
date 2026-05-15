import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "react-quill/dist/quill.snow.css";
import { IoClose } from "react-icons/io5";
import { IoIosCloseCircle } from "react-icons/io";
import { useEditor, EditorContent } from "@tiptap/react";

import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";

import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import HardBreak from "@tiptap/extension-hard-break";
import {
    Bold,
    Italic,
    UnderlineIcon,
    List,
    ListOrdered,
    LinkIcon,
    ImageIcon,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Heading1,
    Heading2,
    Heading3,
    Heading4,
    Heading5,
    Heading6,
    Quote,
    Table2,
} from "lucide-react";
function Blog() {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4, 5, 6],
                },
            }),

            HardBreak,

            Underline,

            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class:
                        "text-blue-600 underline hover:text-blue-800 cursor-pointer",
                },
            }),

            Image,

            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),

            Table.configure({
                resizable: true,
            }),

            TableRow,
            TableHeader,
            TableCell,
        ],

        editorProps: {

    attributes: {
        class:
            "min-h-[400px] p-4 focus:outline-none text-gray-800",
    },

    handlePaste(view, event) {

    const html =
        event.clipboardData?.getData("text/html");

    if (html) {

        editor.commands.insertContent(html);

        return true;
    }

    return false;
},
},
    });

    if (!editor) return null;

    // Add Link
    const addLink = () => {
        const url = window.prompt("Enter URL");

        if (!url) return;

        editor.chain().focus().setLink({ href: url }).run();
    };

    // Add Image
    const addImage = () => {

        const input = document.createElement("input");

        input.type = "file";

        input.accept = "image/*";

        input.click();

        input.onchange = (event) => {

            const file = event.target.files?.[0];

            if (!file) return;

            const reader = new FileReader();

            reader.onload = () => {

                editor
                    ?.chain()
                    .focus()
                    .setImage({
                        src: reader.result,
                    })
                    .run();
            };

            reader.readAsDataURL(file);
        };
    };

    // Add Table
    const addTable = () => {
        editor
            .chain()
            .focus()
            .insertTable({
                rows: 3,
                cols: 3,
                withHeaderRow: true,
            })
            .run();
    };

    function MyUploadAdapterPlugin(editor) {
        editor.plugins.get('FileRepository').createUploadAdapter = loader => {
            return {
                upload: async () => {
                    const file = await loader.file;

                    return new Promise(resolve => {
                        const reader = new FileReader();

                        reader.onload = () => {
                            resolve({
                                default: reader.result
                            });
                        };

                        reader.readAsDataURL(file);
                    });
                }
            };
        };
    }
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

        const img = new window.Image();

        const objectUrl = URL.createObjectURL(file);

        img.src = objectUrl;
        img.onload = () => {

            setPreview(objectUrl);

            setFormData((prev) => ({
                ...prev,
                image: file
            }));
        };

        // img.onload = () => {

        //     const requiredWidth = 1920;
        //     const requiredHeight = 600;

        //     // IMAGE DIMENSION VALIDATION
        //     if (
        //         img.width !== requiredWidth ||
        //         img.height !== requiredHeight
        //     ) {

        //         alert(
        //             `Please upload image size ${requiredWidth}x${requiredHeight}px`
        //         );

        //         URL.revokeObjectURL(objectUrl);

        //         if (fileInputRef.current) {
        //             fileInputRef.current.value = "";
        //         }

        //         return;
        //     }

        //     setPreview(objectUrl);

        //     setFormData((prev) => ({
        //         ...prev,
        //         image: file
        //     }));
        // };
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
                                    <div className="relative mt-4 w-full">

                                        <img
                                            src={preview}
                                            alt="Blog preview"
                                            className="w-full h-72 object-cover rounded-lg"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => {

                                                setPreview("");

                                                setFormData((prev) => ({
                                                    ...prev,
                                                    image: null
                                                }));

                                                if (fileInputRef.current) {
                                                    fileInputRef.current.value = "";
                                                }
                                            }}
                                            className="absolute top-2 right-2"
                                        >
                                            <IoIosCloseCircle className="text-red-600 rounded-full p-0 text-3xl" />
                                        </button>

                                    </div>
                                )}

                                <span className="text-sm text-gray-600 mt-3">
                                    PNG , JPG , WEBP or GIF (max.5MB)
                                </span>
                            </div>
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
                            maxLength={60}
                        />

                        {/* META DESCRIPTION */}
                        <label>Meta Description</label>

                        <textarea name="metaDescription"
                            value={formData.metaDescription}
                            onChange={handleChange}
                            className="border p-2 rounded-lg h-20"
                            maxLength={160}></textarea>

                        {/* CATEGORY */}
                        <label>Categories</label>

                        <div className="flex gap-2">

                            <input
                                type="text"
                                value={categoryInput}
                                onChange={(e) =>
                                    setCategoryInput(e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        addCategory();
                                    }
                                }}
                                className="border p-2 rounded-lg w-full"
                            />

                            <button
                                type="button"
                                onClick={addCategory}
                                className="bg-blue-500 text-white px-4 rounded-lg"
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
                                    className="bg-gray-300 px-3 py-1 rounded-full text-lg cursor-pointer flex gap-1 justify-center items-center"
                                >
                                    {cat}<IoClose className="text-xl mt-1" />
                                </span>
                            ))}
                        </div>

                        {/* DESCRIPTION */}
                        <label>Description *</label>

                        <div className="bg-white rounded-lg">
                            <div className="max-w-5xl mx-auto mt-10 border rounded-xl overflow-hidden shadow-lg">

                                {/* Toolbar */}
                                <div className="flex flex-wrap items-center gap-2 p-3 border-b bg-gray-100">

                                    {/* Heading part */}
                                    <select
                                        value={
                                            editor.isActive("heading", { level: 1 })
                                                ? "1"
                                                : editor.isActive("heading", { level: 2 })
                                                    ? "2"
                                                    : editor.isActive("heading", { level: 3 })
                                                        ? "3"
                                                        : editor.isActive("heading", { level: 4 })
                                                            ? "4"
                                                            : editor.isActive("heading", { level: 5 })
                                                                ? "5"
                                                                : editor.isActive("heading", { level: 6 })
                                                                    ? "6"
                                                                    : "paragraph"
                                        }
                                        onChange={(e) => {

                                            const value = e.target.value;

                                            if (value === "paragraph") {

                                                editor
                                                    .chain()
                                                    .focus()
                                                    .setParagraph()
                                                    .run();

                                            } else {

                                                editor
                                                    .chain()
                                                    .focus()
                                                    .toggleHeading({
                                                        level: Number(value),
                                                    })
                                                    .run();
                                            }
                                        }}
                                        className="border border-gray-300 rounded-lg px-5 py-1 text-sm bg-white outline-none"
                                    >

                                        <option value="paragraph">
                                            Paragraph
                                        </option>

                                        <option value="1">
                                            Heading 1
                                        </option>

                                        <option value="2">
                                            Heading 2
                                        </option>

                                        <option value="3">
                                            Heading 3
                                        </option>

                                        <option value="4">
                                            Heading 4
                                        </option>

                                        <option value="5">
                                            Heading 5
                                        </option>

                                        <option value="6">
                                            Heading 6
                                        </option>

                                    </select>

                                    <div className="w-px h-6 bg-gray-300"></div>

                                    {/* Bold */}
                                    <button
                                        onClick={() => editor.chain().focus().toggleBold().run()}
                                        className={`p-2 rounded ${editor.isActive("bold")
                                            ? "bg-gray-300"
                                            : "hover:bg-gray-200"
                                            }`}
                                    >
                                        <Bold size={18} />
                                    </button>

                                    {/* Italic */}
                                    <button
                                        onClick={() => editor.chain().focus().toggleItalic().run()}
                                        className={`p-2 rounded ${editor.isActive("italic")
                                            ? "bg-gray-300"
                                            : "hover:bg-gray-200"
                                            }`}
                                    >
                                        <Italic size={18} />
                                    </button>

                                    {/* Underline */}
                                    <button
                                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                                        className={`p-2 rounded ${editor.isActive("underline")
                                            ? "bg-gray-300"
                                            : "hover:bg-gray-200"
                                            }`}
                                    >
                                        <UnderlineIcon size={18} />
                                    </button>

                                    <div className="w-px h-6 bg-gray-300"></div>

                                    {/* Bullet List */}
                                    <button
                                        onClick={() =>
                                            editor.chain().focus().toggleBulletList().run()
                                        }
                                        className={`p-2 rounded ${editor.isActive("bulletList")
                                            ? "bg-gray-300"
                                            : "hover:bg-gray-200"
                                            }`}
                                    >
                                        <List size={18} />
                                    </button>

                                    {/* Ordered List */}
                                    <button
                                        onClick={() =>
                                            editor.chain().focus().toggleOrderedList().run()
                                        }
                                        className={`p-2 rounded ${editor.isActive("orderedList")
                                            ? "bg-gray-300"
                                            : "hover:bg-gray-200"
                                            }`}
                                    >
                                        <ListOrdered size={18} />
                                    </button>

                                    <div className="w-px h-6 bg-gray-300"></div>

                                    {/* Link */}
                                    <button
                                        onClick={addLink}
                                        className="p-2 rounded hover:bg-gray-200"
                                    >
                                        <LinkIcon size={18} />
                                    </button>

                                    {/* Image */}
                                    <button
                                        onClick={addImage}
                                        className="p-2 rounded hover:bg-gray-200"
                                    >
                                        <ImageIcon size={18} />
                                    </button>

                                    {/* Table */}
                                    <button
                                        onClick={addTable}
                                        className="p-2 rounded hover:bg-gray-200"
                                    >
                                        <Table2 size={18} />
                                    </button>

                                    <div className="w-px h-6 bg-gray-300"></div>

                                    {/* Align Left */}
                                    <button
                                        onClick={() =>
                                            editor.chain().focus().setTextAlign("left").run()
                                        }
                                        className="p-2 rounded hover:bg-gray-200"
                                    >
                                        <AlignLeft size={18} />
                                    </button>

                                    {/* Align Center */}
                                    <button
                                        onClick={() =>
                                            editor.chain().focus().setTextAlign("center").run()
                                        }
                                        className="p-2 rounded hover:bg-gray-200"
                                    >
                                        <AlignCenter size={18} />
                                    </button>

                                    {/* Align Right */}
                                    <button
                                        onClick={() =>
                                            editor.chain().focus().setTextAlign("right").run()
                                        }
                                        className="p-2 rounded hover:bg-gray-200"
                                    >
                                        <AlignRight size={18} />
                                    </button>

                                    <div className="w-px h-6 bg-gray-300"></div>

                                    {/* Quote */}
                                    <button
                                        onClick={() =>
                                            editor.chain().focus().toggleBlockquote().run()
                                        }
                                        className={`p-2 rounded ${editor.isActive("blockquote")
                                            ? "bg-gray-300"
                                            : "hover:bg-gray-200"
                                            }`}
                                    >
                                        <Quote size={18} />
                                    </button>
                                </div>

                                {/* Editor */}
                                <EditorContent
                                    editor={editor}
                                    className="
                                    h-[500px]
                                    overflow-y-auto
                                    prose
                                    [&_p]:mb-4
                                    max-w-none
                                    bg-white

                                    [&_h1]:text-3xl
                                    [&_h1]:font-bold

                                    [&_h2]:text-2xl
                                    [&_h2]:font-bold

                                    [&_h3]:text-xl
                                    [&_h3]:font-bold

                                    [&_h4]:text-lg
                                    [&_h4]:font-semibold

                                    [&_h5]:text-base
                                    [&_h5]:font-semibold

                                    [&_h6]:text-sm
                                    [&_h6]:font-semibold

                                    [&_p]:text-gray-700

                                    [&_ul]:list-disc
                                    [&_ul]:pl-6

                                    [&_ol]:list-decimal
                                    [&_ol]:pl-6

                                    [&_blockquote]:border-l-4
                                    [&_blockquote]:border-gray-300
                                    [&_blockquote]:pl-4
                                    [&_blockquote]:italic

                                    [&_table]:w-full
                                    [&_table]:border-collapse
                                    [&_table]:my-4

                                    [&_th]:border
                                    [&_th]:border-gray-300
                                    [&_th]:bg-gray-100
                                    [&_th]:p-2

                                    [&_td]:border
                                    [&_td]:border-gray-300
                                    [&_td]:p-2
                                    "
                                />
                            </div>
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
                                <div className="flex items-center text-gray-400 text-xs mb-3">
                                    {blog.createdAt
                                        ? new Date(blog.createdAt).toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                        })
                                        : ""}
                                </div>

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