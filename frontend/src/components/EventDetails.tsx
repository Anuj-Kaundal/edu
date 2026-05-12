import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FaRegCalendar, FaRegClock } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { CiUser } from "react-icons/ci";
import {
    Calendar,
    User,
    List,
    ArrowLeft,
    ChevronDown,
    ChevronRight
} from "lucide-react";
import Footer from "./Footer";

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [event, setEvent] = useState<any>(null);
    const [allEvents, setAllEvents] = useState<any[]>([]);
    const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        window.scrollTo(0, 0);

        // Fetch Current Event
        axios
            .get(`http://localhost:5000/events/${id}`)
            .then((res) => {
                setEvent(res.data);
            })
            .catch((err) => console.log(err));

        // Fetch All Events
        axios
            .get("http://localhost:5000/event")
            .then((res) => {
                const eventsData = res.data.events || res.data.data || res.data;
                setAllEvents(Array.isArray(eventsData) ? eventsData : []);
            })
            .catch((err) => console.log(err));
    }, [id]);

    // --- HELPER FUNCTIONS WITH SAFETY CHECKS ---
    const getDayName = (dateStr: string) => {
        if (!dateStr) return "N/A";
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleDateString('en-US', { weekday: 'long' });
    };

    const formatTimeWithAMPM = (timeStr: string) => {
        if (!timeStr || typeof timeStr !== 'string') return "TBA"; // "To Be Announced" fallback
        
        const parts = timeStr.split(':');
        if (parts.length === 0) return timeStr;

        const hours = parseInt(parts[0]);
        if (isNaN(hours)) return timeStr;

        const period = hours >= 12 ? 'PM' : 'AM';
        return `${timeStr} ${period}`;
    };

    if (!event) {
        return (
            <div className="flex justify-center items-center h-screen text-gray-500">
                <div className="animate-pulse">Loading Event...</div>
            </div>
        );
    }

    const relatedEvents = allEvents.filter(
        (item) => String(item._id || item.id) !== String(event._id || event.id)
    );

    // --- NESTED TOC LOGIC ---
    const rawContent = event.content || event.description || "";
    const tocStructure: any[] = [];
    let lastH2: any = null;

    const contentWithIds = rawContent.replace(
        /<(h[23])>(.*?)<\/\1>/g,
        (match: any, tag: any, text: any) => {
            const cleanText = text.replace(/<[^>]*>?/gm, "");
            const headingId = cleanText.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");

            if (tag === 'h2') {
                lastH2 = { text: cleanText, id: headingId, subheadings: [] };
                tocStructure.push(lastH2);
            } else if (tag === 'h3' && lastH2) {
                lastH2.subheadings.push({ text: cleanText, id: headingId });
            }

            return `<${tag} id="${headingId}" class="scroll-mt-24 font-bold text-gray-900 mt-8 mb-4">${text}</${tag}>`;
        }
    );

    const handleScroll = (elementId: string) => {
        const element = document.getElementById(elementId);
        if (element) {
            window.scrollTo({
                top: element.offsetTop - 100,
                behavior: "smooth"
            });
        }
    };

    const toggleMenu = (h2Id: string) => {
        setOpenMenus(prev => ({ ...prev, [h2Id]: !prev[h2Id] }));
    };

    const handleH2Click = (h2Id: string) => {
        handleScroll(h2Id);
        toggleMenu(h2Id);
    };

    return (
        <>
            <div className="bg-[#F8FAFC] min-h-screen pb-20">
                <div className="h-24"></div>

                <div className="lg:px-20 p-4 md:p-10 max-w-7xl mx-auto flex">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-8 group transition-colors border-none bg-transparent cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-semibold">Back to Events</span>
                    </button>

                    <div className="flex flex-col lg:flex-row gap-8  max-w-7xl mx-auto justify-center">
                        {/* LEFT CONTENT */}
                        <main className="lg:flex-1">
                            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                                {event.image && <img src={event.image} alt={event.title} className="w-full lg:h-[400px] object-fill" />}
                                <div className="flex flex-col gap-6 p-6 md:p-10">
                                    <h1 className="text-2xl md:text-4xl font-extrabold text-yellow-700 leading-tight">
                                        {event.title}
                                    </h1>
                                    <h1>ANUJ TESTING 123</h1>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-y border-gray-100 py-6">
                                        <div className="flex gap-4 items-center">
                                            <FaRegCalendar className="bg-gray-100 h-10 w-10 text-blue-600 p-2.5 rounded-lg" />
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase font-bold">Date</p>
                                                <p className="text-gray-700 font-medium">{getDayName(event.date)}, {event.date || "TBA"}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 items-center">
                                            <FaRegClock className="bg-gray-100 h-10 w-10 text-blue-600 p-2.5 rounded-lg" />
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase font-bold">Time</p>
                                                <p className="text-gray-700 font-medium">{formatTimeWithAMPM(event.time)}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 items-center">
                                            <IoLocationOutline className="bg-gray-100 h-10 w-10 text-blue-600 p-2.5 rounded-lg" />
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase font-bold">Venue</p>
                                                <p className="text-gray-700 font-medium">{event.venue || "Online/TBA"}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 items-center">
                                            <CiUser className="bg-gray-100 h-10 w-10 text-blue-600 p-2.5 rounded-lg" />
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase font-bold">Organizer</p>
                                                <p className="text-gray-700 font-medium">{event.organizer || "Anonymous"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        className="prose prose-blue max-w-none text-gray-700 leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: contentWithIds }}
                                    />
                                </div>
                            </div>
                        </main>

                        {/* RIGHT SIDEBAR */}
                        <aside className="lg:w-80">
                            <div className="sticky top-28 space-y-6">
                                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <List className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-lg">Table of Contents</h3>
                                    </div>

                                    <nav className="space-y-3">
                                        {tocStructure.map((h2, i) => (
                                            <div key={i} className="flex flex-col border-b border-gray-50 last:border-0 pb-2">
                                                <button
                                                    onClick={() => handleH2Click(h2.id)}
                                                    className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl text-sm transition-all duration-300 border-none cursor-pointer
                                                        ${openMenus[h2.id] ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50 bg-transparent'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${openMenus[h2.id] ? 'bg-blue-600' : 'bg-gray-300'}`}></span>
                                                        <span className="font-bold text-left line-clamp-1">{h2.text}</span>
                                                    </div>
                                                    {h2.subheadings.length > 0 && (
                                                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${openMenus[h2.id] ? 'rotate-180' : ''}`} />
                                                    )}
                                                </button>

                                                {openMenus[h2.id] && h2.subheadings.length > 0 && (
                                                    <div className="ml-7 mt-1 space-y-1 border-l-2 border-blue-100 pl-3">
                                                        {h2.subheadings.map((h3: any, j: number) => (
                                                            <button
                                                                key={j}
                                                                onClick={() => handleScroll(h3.id)}
                                                                className="w-full text-left py-2 px-2 text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors bg-transparent border-none cursor-pointer block"
                                                            >
                                                                {h3.text}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {tocStructure.length === 0 && <p className="text-gray-400 text-sm italic">No sections found.</p>}
                                    </nav>
                                </div>
                            </div>
                        </aside>
                    </div>

                    {/* OTHER EVENTS SECTION */}
                    <div className="mt-20">
                        <h2 className="text-3xl font-bold text-gray-900 mb-10">Other Events</h2>
                        {relatedEvents.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {relatedEvents.slice(0, 3).map((item) => (
                                    <div
                                        key={item._id || item.id}
                                        onClick={() => {
                                            navigate(`/events/${item._id || item.id}`);
                                            window.scrollTo({ top: 0, behavior: "smooth" });
                                        }}
                                        className="group bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                                    >
                                        <div className="h-56 overflow-hidden">
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                {item.title}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                                <Calendar className="w-4 h-4 text-orange-500" />
                                                <span>{item.date || "TBA"}</span>
                                            </div>
                                            <p>{event.description.slice(0, 80)}.....</p>
                                            <div className="mt-4 flex items-center text-sm text-blue-600 font-bold">
                                                View Details <ChevronRight className="w-4 h-4 ml-1" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
                                <p className="text-gray-400 text-lg italic">No other events found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default EventDetails;