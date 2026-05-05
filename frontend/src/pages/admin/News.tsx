import React, { useState, useEffect, useRef } from 'react'
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

function News() {

    const [activeTab, setActiveTab] = useState("create");

    const [formData, setFormData] = useState({
        image: null,
        title: "",
        url: "",
        description: "",
        author: "",
        categories: [],
        date: "",
        tags: "",
        content: ""
    });

    const [categoryInput, setCategoryInput] = useState("");
    const [newsList, setNewsList] = useState([]);

    // ✅ ADDED
    const formRef = useRef();
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

    // FETCH NEWS
    const fetchNews = async () => {
        try {
            const res = await fetch("http://localhost:5000/shownew");
            const data = await res.json();
            setNewsList(data);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        if (activeTab === "show") {
            fetchNews();
        }
    }, [activeTab]);

    // INPUT
    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === "image") {
            setFormData({ ...formData, image: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleContentChange = (value) => {
        setFormData({ ...formData, content: value });
    };

    // CATEGORY
    const addCategory = () => {
        if (categoryInput.trim()) {
            setFormData({
                ...formData,
                categories: [...formData.categories, categoryInput]
            });
            setCategoryInput("");
        }
    };

    const removeCategory = (index) => {
        const updated = formData.categories.filter((_, i) => i !== index);
        setFormData({ ...formData, categories: updated });
    };

    // SUBMIT
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const data = new FormData();

            Object.keys(formData).forEach(key => {
                if (key === "categories") {
                    data.append("categories", JSON.stringify(formData.categories));
                } else {
                    data.append(key, formData[key]);
                }
            });

            const res = await fetch("http://localhost:5000/news", {
                method: "POST",
                body: data
            });

            const result = await res.json();

            if (res.ok) {
                alert("News Added ✅");

                // reset state
                setFormData({
                    image: null,
                    title: "",
                    url: "",
                    description: "",
                    author: "",
                    categories: [],
                    date: "",
                    tags: "",
                    content: ""
                });

                setCategoryInput("");

                // ✅ reset form + file input
                formRef.current.reset();

                // ✅ reset ReactQuill
                setEditorKey(prev => prev + 1);

            } else {
                alert(result.error);
            }

        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className='flex flex-col p-10 w-full'>

            {/* TABS */}
            <div className='flex gap-10 text-xl font-semibold pb-10'>
                <h1
                    onClick={() => setActiveTab("create")}
                    className={`cursor-pointer ${activeTab === "create" ? "text-blue-600 border-b-2 border-blue-600" : ""}`}
                >
                    Create News
                </h1>

                <h1
                    onClick={() => setActiveTab("show")}
                    className={`cursor-pointer ${activeTab === "show" ? "text-blue-600 border-b-2 border-blue-600" : ""}`}
                >
                    Show News
                </h1>
            </div>

            {/* CREATE */}
            {activeTab === "create" && (
                <div className='w-full max-w-4xl bg-gray-200 p-5 rounded-lg shadow-md'>
                    <form ref={formRef} className='flex flex-col gap-3' onSubmit={handleSubmit}>

                        {/* IMAGE */}
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
                                        name="image"
                                        className="hidden"
                                        onChange={handleChange}
                                    />
                                </label>

                                {formData.image && (
                                    <img
                                        src={URL.createObjectURL(formData.image)}
                                        alt="preview"
                                        className="w-40 mt-4 rounded-lg"
                                    />
                                )}
                            </div>
                        </div>

                        <h1 className='text-lg font-semibold pt-2 pb-2'>News Details</h1>

                        <label>Title *</label>
                        <input type="text" name="title" value={formData.title}
                            onChange={handleChange} className='border p-2 rounded-lg' required />

                        <label>Author *</label>
                        <input type="text" name="author" value={formData.author}
                            onChange={handleChange} className='border p-2 rounded-lg' required />

                        <label>Custom URL *</label>
                        <input type="text" name="url" value={formData.url}
                            onChange={handleChange} className='border p-2 rounded-lg' required />

                        <label>Description *</label>
                        <textarea name="description" value={formData.description}
                            onChange={handleChange} className='border p-2 rounded-lg h-20' required />

                        {/* CATEGORY */}
                        <label>Categories</label>
                        <div className="flex gap-2">
                            <input
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
                                <span key={index}
                                    className="bg-gray-300 px-3 py-1 rounded-full text-sm cursor-pointer"
                                    onClick={() => removeCategory(index)}>
                                    {cat} ❌
                                </span>
                            ))}
                        </div>

                        <label>Date</label>
                        <input type="date" name="date" value={formData.date}
                            onChange={handleChange} className='border p-2 rounded-lg' />

                        <label>Tags</label>
                        <input type="text" name="tags" value={formData.tags}
                            onChange={handleChange} className='border p-2 rounded-lg' />

                        <label>Content *</label>
                        <div className="bg-white rounded-lg">
                            <ReactQuill
                                key={editorKey}
                                value={formData.content}
                                onChange={handleContentChange}
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

            {/* SHOW */}
            {activeTab === "show" && (
                <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>

                    {newsList.length === 0 ? (
                        <p>No news found</p>
                    ) : (
                        newsList.map((item) => (
                            <div key={item._id} className='bg-gray-100 p-3 rounded-lg shadow-md'>

                                <img src={item.image} className='w-full h-40 object-cover rounded-lg' />

                                <h2 className='font-bold mt-2'>{item.title}</h2>
                                <p className='text-sm text-gray-600'>{item.description}</p>

                                <p className='text-xs mt-1'>
                                    By {item.author} | {item.date}
                                </p>

                                <div className='flex flex-wrap gap-1 mt-2'>
                                    {(() => {
                                        try {
                                            const categories =
                                                typeof item.categories === "string"
                                                    ? JSON.parse(item.categories)
                                                    : item.categories;

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
                        ))
                    )}

                </div>
            )}
        </div>
    );
}

export default News;