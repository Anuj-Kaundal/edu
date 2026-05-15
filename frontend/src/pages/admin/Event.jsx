import React, { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { IoIosCloseCircle } from "react-icons/io";

// for content section
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
function Event() {
    // this part is for content section
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
    // end here
    const [addData, setAddData] = useState('');

    const editorConfiguration = {
        extraPlugins: [MyUploadAdapterPlugin],
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
                // 'mediaEmbed',
                'outdent', 'indent',
                '|',
                'link', 'insertTable', 'blockQuote', 'undo', 'redo'
            ],
            simpleUpload: {
                uploadUrl: 'https://example.com/your-upload-endpoint',
                headers: {
                    'X-CSRF-TOKEN': 'CSFR-Token',
                    Authorization: 'Bearer <JSON Web Token>'
                }
            },
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

    const initialState = {
        image: null,
        title: "",
        url: "",
        description: "",
        organizer: "",
        // categories: [],
        // tags: "",
        date: "",
        time: "",
        venue: "",
        content: ""
    };

    const [formData, setFormData] = useState(initialState);
    const [categoryInput, setCategoryInput] = useState("");
    const [eventList, setEventList] = useState([]);
    const [preview, setPreview] = useState("");

    const formRef = useRef();
    const fileInputRef = useRef(null);

    const [editorKey, setEditorKey] = useState(0);

    const modules = {
        toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image"],
            ["clean"]
        ]
    };

    // FETCH EVENTS
    const fetchEvent = async () => {

        try {

            const res = await fetch(
                "http://localhost:5000/showevent"
            );

            const data = await res.json();

            const formattedData = data.map((item) => {

                let finalCategories = [];

                if (typeof item.categories === "string") {

                    try {

                        finalCategories = JSON.parse(
                            item.categories
                        );

                    } catch (e) {

                        finalCategories = item.categories
                            .split(",")
                            .map((c) => c.trim());
                    }

                } else if (Array.isArray(item.categories)) {

                    finalCategories = item.categories;
                }

                return {
                    ...item,
                    categories: finalCategories
                };
            });

            setEventList(formattedData.reverse());

        } catch (err) {

            console.log("Fetch Error:", err);
        }
    };

    useEffect(() => {

        if (activeTab === "show") {

            fetchEvent();
        }

    }, [activeTab]);

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

    // INPUT CHANGE
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

    // CONTENT CHANGE (FIXED)
    const handleContentChange = (event, editor) => {
        const data = editor.getData();
        setFormData((prev) => ({
            ...prev,
            content: data
        }));
    };

    // CATEGORY ADD
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

    // CATEGORY REMOVE
    const removeCategory = (index) => {

        setFormData((prev) => ({
            ...prev,
            categories: prev.categories.filter((_, i) => i !== index)
        }));
    };

    // EDIT EVENT
    const editEvent = (item) => {

        setActiveTab("create");

        setEditId(item._id);

        setFormData({
            image: null,
            title: item.title || "",
            url: item.url || "",
            description: item.description || "",
            author: item.author || "",
            categories: item.categories || [],
            tags: item.tags || "",
            content: item.content || ""
        });

        setPreview(item.image);
    };

    // DELETE EVENT
    const deleteEvent = async (id) => {

        try {

            const res = await fetch(
                `http://localhost:5000/deleteevent/${id}`,
                {
                    method: "DELETE"
                }
            );

            if (res.ok) {

                alert("Event Deleted ✅");

                fetchEvent();

            } else {

                alert("Delete failed");
            }

        } catch (error) {

            console.log(error);
        }
    };

    // SUBMIT
    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const data = new FormData();

            Object.keys(formData).forEach((key) => {

                if (key === "categories") {

                    data.append(
                        "categories",
                        JSON.stringify(formData.categories)
                    );

                } else if (key !== "content") {

                    data.append(key, formData[key]);
                }
            });

            // TipTap HTML content
            data.append("content", editor.getHTML());

            // UPDATE EVENT
            if (editId) {

                const res = await fetch(
                    `http://localhost:5000/updateevent/${editId}`,
                    {
                        method: "PUT",
                        body: data
                    }
                );

                const result = await res.json();

                if (res.ok) {

                    alert("Event Updated ✅");
                    setActiveTab("show");
                } else {

                    alert(
                        result.error ||
                        "Something went wrong"
                    );
                }

            } else {

                // CREATE EVENT
                const res = await fetch(
                    "http://localhost:5000/Event",
                    {
                        method: "POST",
                        body: data
                    }
                );

                const result = await res.json();

                if (res.ok) {

                    alert("Event Added ✅");

                } else {

                    alert(
                        result.error ||
                        "Something went wrong"
                    );
                }
            }

            // RESET FORM
            setEditId(null);

            setFormData(initialState);

            setCategoryInput("");

            setPreview("");

            formRef.current.reset();

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            setEditorKey((prev) => prev + 1);

            fetchEvent();

        } catch (err) {

            console.log("Submit Error:", err);
        }
    };

    return (

        <div className="flex flex-col items-center p-10 w-full">
            {/* Height Style Fix */}
            <style>{`.ck-editor__editable_inline { min-height: 200px !important; }`}</style>

            {/* TABS */}
            <div className="flex justify-start w-full max-w-4xl gap-10 text-xl font-semibold pb-10">

                <h1
                    onClick={() => setActiveTab("create")}
                    className={`cursor-pointer ${activeTab === "create"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : ""
                        }`}
                >
                    Create Event
                </h1>

                <h1
                    onClick={() => setActiveTab("show")}
                    className={`cursor-pointer ${activeTab === "show"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : ""
                        }`}
                >
                    Show Events
                </h1>
            </div>

            {/* CREATE EVENT */}
            {activeTab === "create" && (

                <div className="min-h-screen bg-[#f8f9fa] p-6 text-[#334155]">

                    <form ref={formRef} onSubmit={handleSubmit} className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* LEFT COLUMN: Main Details */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Event Details Card */}
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                                <h2 className="text-lg font-bold mb-6">Event Details</h2>

                                <div className="space-y-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium">Event Title <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            name="title"
                                            placeholder="Enter event title..."
                                            value={formData.title}
                                            onChange={handleChange}
                                            className="w-full border border-gray-200 p-3 rounded-lg focus:ring-1 outline-none placeholder:text-gray-300"
                                            required
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium italic text-gray-600"># URL Slug <span className="text-red-500">*</span></label>
                                        <div className="flex border border-gray-200 rounded-lg overflow-hidden focus-within:ring-1 transition-all">
                                            {/* <span className="bg-gray-50 px-4 py-3 text-gray-500 border-r border-gray-200 text-sm">/events/</span> */}
                                            <input
                                                type="text"
                                                name="url"
                                                value={formData.url}
                                                readOnly
                                                className="w-full p-3 bg-white outline-none text-gray-400 text-sm"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium">Short Description <span className="text-red-500">*</span></label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="Brief description for event cards and previews..."
                                            className="w-full border border-gray-200 p-3 rounded-lg h-32 focus:ring-1 outline-none resize-none placeholder:text-gray-300"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Event Content Card */}
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                                <h2 className="text-lg font-bold mb-2">Event Content <span className="text-red-500">*</span></h2>
                                <p className="text-sm text-gray-500 mb-6">Create detailed content for your event page with rich formatting, images, and more.</p>
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
                                            
                                                                    h-[400px]
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
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Sidebar */}
                        <div className="space-y-8">

                            {/* Event Information Card */}
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                                <h2 className="text-lg font-bold mb-6">Event Information</h2>

                                <div className="space-y-5">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium">Event Date <span className="text-red-500">*</span></label>
                                        <input
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleChange}
                                            className="w-full border border-gray-200 p-3 rounded-lg text-sm text-gray-500"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium">Event Time <span className="text-red-500">*</span></label>
                                        <input
                                            type="time"
                                            name="time"
                                            value={formData.time}
                                            onChange={handleChange}
                                            className="w-full border border-gray-200 p-3 rounded-lg text-sm text-gray-500"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium">Venue <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            name="venue"
                                            placeholder="Event venue or location"
                                            value={formData.venue}
                                            onChange={handleChange}
                                            className="w-full border border-gray-200 p-3 rounded-lg text-sm focus:ring-1 focus:ring-purple-500 outline-none placeholder:text-gray-300"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium">Organizer</label>
                                        <input
                                            type="text"
                                            name="organizer"
                                            value={formData.organizer}
                                            onChange={handleChange}
                                            className="w-full border border-gray-200 p-3 rounded-lg text-sm focus:ring-1 focus:ring-purple-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Featured Image Card */}
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                                <h2 className="text-lg font-bold mb-6">Featured Image</h2>
                                <div
                                    onClick={() => fileInputRef.current.click()}
                                    className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-all min-h-[200px]"
                                >
                                    <input type="file" name="image" ref={fileInputRef} className="hidden" onChange={handleImageChange} />

                                    {!preview ? (
                                        <div className="text-center">
                                            <div className="bg-gray-200 p-3 rounded-lg inline-block mb-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <p className="text-sm font-medium text-gray-600">Click to upload image</p>
                                            <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP up to 5MB</p>
                                        </div>
                                    ) : (
                                        <div className="relative w-full">

                                            <img
                                                src={preview}
                                                alt="Preview"
                                                className="w-full h-auto rounded-lg shadow-sm"
                                            />

                                            {/* Remove Button */}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();

                                                    setPreview("");

                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        image: null,
                                                    }));

                                                    if (fileInputRef.current) {
                                                        fileInputRef.current.value = "";
                                                    }
                                                }}
                                                className="
                                                absolute
                                                top-3
                                                right-3">
                                                <IoIosCloseCircle className="text-red-600 text-3xl"/>

                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Floating Submit Button (Bottom) */}
                        <div className="lg:col-span-3 flex justify-center">
                            <button className="bg-blue-500 hover:bg-blue-600 text-white p-2 w-60 rounded-lg mt-5">

                                {editId
                                    ? "Update Event"
                                    : "Add Event"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
            {/* SHOW EVENTS */}
            {activeTab === "show" && (

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                    {eventList.length === 0 ? (

                        <p>No Event found</p>

                    ) : (

                        eventList.map((item) => (

                            <div
                                key={item._id}
                                className="bg-gray-100 p-3 rounded-lg shadow-md"
                            >

                                {/* IMAGE */}
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-40 object-cover rounded-lg"
                                />

                                {/* TITLE */}
                                <div className="flex justify-between items-center mt-2">

                                    <div>
                                        <h2 className="font-bold mt-2">
                                            {item.title}
                                        </h2>
                                    </div>

                                    <div className="flex gap-5">

                                        <button
                                            className="bg-green-500 text-white px-2 py-1 text-sm rounded-lg"
                                            onClick={() =>
                                                editEvent(item)
                                            }
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="bg-red-500 text-white px-2 py-1 text-sm rounded-lg"
                                            onClick={() =>
                                                deleteEvent(
                                                    item._id
                                                )
                                            }
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                {/* DESCRIPTION */}
                                <div>

                                    <p
                                        className={`text-sm text-gray-600 ${expandedId === item._id
                                            ? ""
                                            : "line-clamp-3"
                                            }`}
                                    >
                                        {item.description}
                                    </p>

                                    {item.description?.length >
                                        120 && (
                                            <button
                                                onClick={() =>
                                                    setExpandedId(
                                                        expandedId ===
                                                            item._id
                                                            ? null
                                                            : item._id
                                                    )
                                                }
                                                className="text-blue-500 text-sm mt-1"
                                            >
                                                {expandedId ===
                                                    item._id
                                                    ? "View Less"
                                                    : "View More"}
                                            </button>
                                        )}
                                </div>

                                {/* CATEGORIES */}
                                <div className="flex flex-wrap gap-1 mt-2">

                                    {Array.isArray(
                                        item.categories
                                    ) &&
                                        item.categories.map(
                                            (cat, i) => (
                                                <span
                                                    key={i}
                                                    className="bg-gray-300 px-2 py-1 text-xs rounded"
                                                >
                                                    {cat}
                                                </span>
                                            )
                                        )}
                                </div>

                                {/* AUTHOR + DATE */}
                                <p className="text-xs mt-2 text-gray-500">

                                    By {item.author} |{" "}

                                    {item.date
                                        ? new Date(
                                            item.date
                                        ).toLocaleDateString()
                                        : "No Date"}
                                </p>

                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default Event;