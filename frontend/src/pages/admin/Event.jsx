import React, { useState, useEffect, useRef } from 'react'
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

function Event() {
    const [activeTab, setActiveTab] = useState("create");
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
    const [preview, setPreview] = useState(null);

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

    // ✅ FETCH EVENTS (Enhanced Parsing)
    const fetchEvent = async () => {
        try {
            const res = await fetch("http://localhost:5000/showevent");
            const data = await res.json();
            
            const formattedData = data.map(item => {
                let finalCategories = [];
                if (typeof item.categories === 'string') {
                    try {
                        finalCategories = JSON.parse(item.categories);
                    } catch (e) {
                        finalCategories = item.categories.split(',').map(c => c.trim());
                    }
                } else if (Array.isArray(item.categories)) {
                    finalCategories = item.categories;
                }
                return { ...item, categories: finalCategories };
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

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "image") {
            const file = files[0];
            setFormData(prev => ({ ...prev, image: file }));
            if (file) {
                const objectUrl = URL.createObjectURL(file);
                setPreview(objectUrl);
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleContentChange = (value) => {
        setFormData(prev => ({ ...prev, content: value }));
    };

    const addCategory = () => {
        if (categoryInput.trim()) {
            setFormData(prev => ({
                ...prev,
                categories: [...prev.categories, categoryInput.trim()]
            }));
            setCategoryInput("");
        }
    };

    const removeCategory = (index) => {
        setFormData(prev => ({
            ...prev,
            categories: prev.categories.filter((_, i) => i !== index)
        }));
    };

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

            const res = await fetch("http://localhost:5000/Event", {
                method: "POST",
                body: data
            });

            const result = await res.json();
            if (res.ok) {
                alert("Event Added ✅");
                setFormData(initialState);
                setCategoryInput("");
                setPreview(null);
                setEditorKey(prev => prev + 1);
            } else {
                alert(result.error || "Something went wrong");
            }
        } catch (err) {
            console.log("Submit Error:", err);
        }
    };

    return (
        <div className='flex flex-col p-10 w-full'>
            <div className='flex gap-10 text-xl font-semibold pb-10'>
                <h1 onClick={() => setActiveTab("create")} className={`cursor-pointer ${activeTab === "create" ? "text-blue-600 border-b-2 border-blue-600" : ""}`}>Create Event</h1>
                <h1 onClick={() => setActiveTab("show")} className={`cursor-pointer ${activeTab === "show" ? "text-blue-600 border-b-2 border-blue-600" : ""}`}>Show Events</h1>
            </div>

            {activeTab === "create" && (
                <div className='w-full max-w-4xl bg-gray-200 p-5 rounded-lg shadow-md'>
                    <form ref={formRef} className='flex flex-col gap-3' onSubmit={handleSubmit}>
                        <div className='border-b border-gray-400 pb-5'>
                            <div className="border-2 border-dashed border-gray-400 rounded-xl p-10 flex flex-col items-center bg-gray-100">
                                <label className="cursor-pointer flex items-center gap-3">
                                    <span className="bg-white px-4 py-2 border rounded-md shadow-sm">Choose File</span>
                                    <span className="text-gray-600">{formData.image ? formData.image.name : "No file chosen"}</span>
                                    <input type="file" name="image" className="hidden" onChange={handleChange} />
                                </label>
                                {preview && <img src={preview} alt="preview" className="w-40 mt-4 rounded-lg" />}
                            </div>
                        </div>

                        <h1 className='text-lg font-semibold pt-2 pb-2'>Event Details</h1>
                        <label>Title *</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} className='border p-2 rounded-lg' required />
                        
                        <label>Author *</label>
                        <input type="text" name="author" value={formData.author} onChange={handleChange} className='border p-2 rounded-lg' required />

                        <label>Categories</label>
                        <div className="flex gap-2">
                            <input value={categoryInput} onChange={(e) => setCategoryInput(e.target.value)} className="border p-2 rounded-lg w-full" />
                            <button type="button" onClick={addCategory} className="bg-purple-500 text-white px-4 rounded-lg">Add</button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {formData.categories.map((cat, index) => (
                                <span key={index} className="bg-gray-300 px-3 py-1 rounded-full text-sm cursor-pointer" onClick={() => removeCategory(index)}>
                                    {cat} ❌
                                </span>
                            ))}
                        </div>

                        <label>Date</label>
                        <input type="date" name="date" value={formData.date} onChange={handleChange} className='border p-2 rounded-lg' />

                        <label>Content *</label>
                        <div className="bg-white rounded-lg">
                            <ReactQuill key={editorKey} value={formData.content} onChange={handleContentChange} modules={modules} className="h-80 mb-10" />
                        </div>

                        <button className='bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg'>Submit</button>
                    </form>
                </div>
            )}

            {activeTab === "show" && (
                <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
                    {eventList.length === 0 ? <p>No Event found</p> : (
                        eventList.map((item) => (
                            <div key={item._id} className='bg-gray-100 p-3 rounded-lg shadow-md'>
                                <img src={item.image} alt="event" className='w-full h-40 object-cover rounded-lg' />
                                <h2 className='font-bold mt-2'>{item.title}</h2>
                                <p className='text-sm text-gray-600'>{item.description}</p>
                                
                                <div className='flex flex-wrap gap-1 mt-2'>
                                    {Array.isArray(item.categories) && item.categories.map((cat, i) => (
                                        <span key={i} className='bg-gray-300 px-2 py-1 text-xs rounded'>
                                            {cat}
                                        </span>
                                    ))}
                                </div>

                                <p className='text-xs mt-1'>By {item.author} | {item.date}</p>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default Event;