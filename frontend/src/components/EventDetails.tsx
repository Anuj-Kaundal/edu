import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronRight, Calendar, User, List, ArrowLeft, MapPin } from "lucide-react";
import Footer from "./Footer";

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [allEvents, setAllEvents] = useState([]);
    const [allBlogs, setAllBlogs] = useState([]);

    useEffect(() => {
        // 1. Fetch Single Event Data
        axios.get(`http://localhost:5000/events/${id}`)
            .then((res) => setEvent(res.data))
            .catch(() => console.log("Error fetching event"));

        // 2. Fetch All Events for Related Section
        axios.get("http://localhost:5000/events")
            .then((res) => setAllEvents(res.data))
            .catch(() => console.log("Error fetching all events"));
    }, [id]);

    // Loading State
    if (!event)
        return (
            <div className="flex justify-center items-center h-screen text-gray-400 font-medium animate-pulse">
                Loading Event Details...
            </div>
        );

    // --- NAVIGATION LOGIC (Heading extraction and ID injection) ---
    const rawContent = event.content || event.description || "";
    const headings = [];

    // Yeh Regex HTML content ke andar <h2> aur <h3> tags mein ID inject karta hai
    const contentWithIds = rawContent.replace(/<(h[23])>(.*?)<\/\1>/g, (match, tag, text) => {
        const cleanText = text.replace(/<[^>]*>?/gm, ''); // HTML tags hatana text se
        const headingId = cleanText.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");

        headings.push({ text: cleanText, id: headingId });

        // scroll-mt-24 class ensure karti hai ki header ke niche heading na chupe
        return `<${tag} id="${headingId}" class="scroll-mt-24 font-bold text-gray-900 mt-8 mb-4">${text}</${tag}>`;
    });

    // Smooth Scroll function
    const handleScroll = (elementId) => {
        const element = document.getElementById(elementId);
        if (element) {
            window.scrollTo({
                top: element.offsetTop - 100, // Header ke liye gap
                behavior: "smooth"
            });
        }
    };

    // fetch reated events
    axios.get("http://localhost:5000/event")
        .then((res) => {
            setAllNews(res.data); // Ab ye data fetch karega aur Related News dikhayega!
        });
    return (
        <>
            <div className="bg-[#F8FAFC] min-h-screen pb-20">
                <div className="h-24"></div>

                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    {/* Top Back Navigation */}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-8 group cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-semibold">Back to Events</span>
                    </button>

                    <div className="flex flex-col lg:flex-row gap-12">

                        {/* LEFT COLUMN: Main Content */}
                        <main className="lg:w-2/3">
                            <article className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="w-full h-[400px] overflow-hidden">
                                    <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                                </div>

                                <div className="p-8 md:p-12">
                                    <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                                        {event.title}
                                    </h1>

                                    {/* Event Meta Bar */}
                                    <div className="flex flex-wrap items-center gap-6 text-gray-400 text-sm mb-8 pb-8 border-b border-gray-50">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-orange-500" />
                                            <span className="font-medium text-gray-700">{event.organizer || "Admin"}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-orange-500" />
                                            <span className="font-medium">{event.date}</span>
                                        </div>
                                        {event.location && (
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-orange-500" />
                                                <span className="font-medium text-gray-700">{event.location}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Main Body Content with IDs injected */}
                                    <div
                                        className="prose prose-orange max-w-none text-gray-700 leading-relaxed 
                                        prose-p:mb-5 prose-headings:scroll-mt-24"
                                        dangerouslySetInnerHTML={{ __html: contentWithIds }}
                                    />
                                </div>
                            </article>
                        </main>

                        {/* RIGHT COLUMN: Table of Contents */}
                        <aside className="lg:w-1/3">
                            <div className="sticky top-28 space-y-6">
                                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-orange-50 rounded-lg">
                                            <List className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-lg">Table of Contents</h3>
                                    </div>

                                    <nav className="space-y-1">
                                        {headings.map((h, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleScroll(h.id)}
                                                className="w-full text-left py-2.5 px-4 rounded-xl text-sm text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all flex items-center gap-3 group cursor-pointer"
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-blue-600 transition-colors"></span>
                                                <span className="line-clamp-1">{h.text}</span>
                                            </button>
                                        ))}
                                        {headings.length === 0 && (
                                            <p className="text-gray-400 text-sm italic">No sections found in this article.</p>
                                        )}
                                    </nav>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
};

export default EventDetails;