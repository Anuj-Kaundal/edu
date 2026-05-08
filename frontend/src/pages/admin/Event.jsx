import React, { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

function Event() {
    const [addData, setAddData] = useState('');
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

    const initialState = {
        image: null,
        title: "",
        url: "",
        description: "",
        author: "",
        categories: [],
        date: "",
        tags: "",
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

            setEventList(formattedData);

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
            date: item.date
                ? item.date.split("T")[0]
                : "",
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

                } else {

                    data.append(key, formData[key]);
                }
            });

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

                <div className="w-full max-w-4xl p-5 rounded-lg shadow-md">

                    <form
                        ref={formRef}
                        className="flex flex-col gap-3"
                        onSubmit={handleSubmit}
                    >

                        {/* IMAGE */}
                        <div className="border-b border-gray-400 pb-5">

                            <div className="border-2 border-dashed border-gray-400 rounded-xl p-10 flex flex-col items-center bg-gray-100">

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
                                        name="image"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </label>

                                {/* PREVIEW */}
                                {preview && (
                                    <img
                                        src={preview}
                                        alt="Event preview"
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
                            Event Details
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
                            required
                        />

                        {/* DESCRIPTION */}
                        <label>Description *</label>

                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="border p-2 rounded-lg h-20"
                            required
                        />

                        {/* CATEGORY */}
                        <label>Categories</label>

                        <div className="flex gap-2">

                            <input
                                value={categoryInput}
                                onChange={(e) =>
                                    setCategoryInput(
                                        e.target.value
                                    )
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

                            {formData.categories.map(
                                (cat, index) => (
                                    <span
                                        key={index}
                                        className="bg-gray-300 px-3 py-1 rounded-full text-sm cursor-pointer"
                                        onClick={() =>
                                            removeCategory(
                                                index
                                            )
                                        }
                                    >
                                        {cat} ❌
                                    </span>
                                )
                            )}
                        </div>

                        {/* DATE */}
                        <label>Date</label>

                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            className="border p-2 rounded-lg"
                        />

                        {/* TAGS */}
                        <label>Tags</label>

                        <input
                            type="text"
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            className="border p-2 rounded-lg"
                        />

                        {/* CONTENT */}
                        <label>Content *</label>

                        <div className="bg-white rounded-lg">
                            <CKEditor
                                key={editorKey} // Reset key jab submit ho
                                editor={ClassicEditor}
                                data={formData.content}
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
                        <button className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg mt-5">

                            {editId
                                ? "Update Event"
                                : "Submit"}
                        </button>

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