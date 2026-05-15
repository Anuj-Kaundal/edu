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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchData = async () => {
            try {
                setLoading(true);
                const eventRes = await axios.get(`http://localhost:5000/events/${id}`);
                setEvent(eventRes.data);

                const allRes = await axios.get("http://localhost:5000/event");
                const eventsData = allRes.data.events || allRes.data.data || allRes.data;
                setAllEvents(Array.isArray(eventsData) ? eventsData : []);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const getDayName = (dateStr: string) => {
        if (!dateStr) return "N/A";
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleDateString('en-US', { weekday: 'long' });
    };

    const formatTimeWithAMPM = (timeStr: string) => {
        if (!timeStr || typeof timeStr !== 'string') return "TBA";
        const parts = timeStr.split(':');
        const hours = parseInt(parts[0]);
        if (isNaN(hours)) return timeStr;
        const period = hours >= 12 ? 'PM' : 'AM';
        return `${timeStr} ${period}`;
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen text-gray-400">
            <div className="animate-pulse font-medium">Loading Event...</div>
        </div>
    );

    if (!event) return <div className="text-center py-20 font-bold">Event Not Found!</div>;

    const relatedEvents = allEvents.filter(
        (item) => String(item._id || item.id) !== String(event._id || event.id)
    );

    // --- NESTED TOC LOGIC ---
    const rawContent = event.content || event.description || "";
    const tocStructure: any[] = [];
    let lastH2: any = null;

    const contentWithIds = rawContent.replace(/<(h[23])>(.*?)<\/\1>/g, (match: any, tag: any, text: any) => {
        const cleanText = text.replace(/<[^>]*>?/gm, "");
        const headingId = cleanText.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");

        if (tag === 'h2') {
            lastH2 = { text: cleanText, id: headingId, subheadings: [] };
            tocStructure.push(lastH2);
        } else if (tag === 'h3' && lastH2) {
            lastH2.subheadings.push({ text: cleanText, id: headingId });
        }
        return `<${tag} id="${headingId}" class="scroll-mt-24 font-bold text-gray-900 mt-8 mb-4">${text}</${tag}>`;
    });

    const handleScroll = (targetId: string) => {
        const element = document.getElementById(targetId);
        if (element) window.scrollTo({ top: element.offsetTop - 100, behavior: "smooth" });
    };

    const toggleMenu = (h2Id: string) => setOpenMenus(prev => ({ ...prev, [h2Id]: !prev[h2Id] }));

    return (
        <>
            <div className="min-h-screen">
                <div className="w-full flex justify-center">
                    <div className="flex flex-col lg:flex-row gap-5">
                        {/* LEFT: MAIN CONTENT */}
                        <main className="lg:w-[100%] max-w-7xl mx-auto ml-20">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-8 group bg-transparent border-none cursor-pointer"
                            >
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                <span className="text-sm font-semibold">Back to Events</span>
                            </button>

                            <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                {event.image && <img src={event.image} alt={event.title} className="w-full lg:h-[500px] object-fill" />}

                                <div className="p-8 md:p-12">
                                    <h1 className="text-xl md:text-3xl font-extrabold text-gray-900 mb-6 leading-tight">
                                        {event.title}
                                    </h1>

                                    {/* EVENT META INFO (Quick Details) */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-y border-gray-50 py-8 mb-8">
                                        <div className="flex gap-4 items-center">
                                            <FaRegCalendar className="bg-blue-50 h-10 w-10 text-blue-600 p-2.5 rounded-lg" />
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase font-bold">Date</p>
                                                <p className="text-gray-700 font-semibold">{getDayName(event.date)}, {event.date}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 items-center">
                                            <FaRegClock className="bg-blue-50 h-10 w-10 text-blue-600 p-2.5 rounded-lg" />
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase font-bold">Time</p>
                                                <p className="text-gray-700 font-semibold">{formatTimeWithAMPM(event.time)}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 items-center">
                                            <IoLocationOutline className="bg-blue-50 h-10 w-10 text-blue-600 p-2.5 rounded-lg" />
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase font-bold">Venue</p>
                                                <p className="text-gray-700 font-semibold">{event.venue || "Online/TBA"}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 items-center">
                                            <CiUser className="bg-blue-50 h-10 w-10 text-blue-600 p-2.5 rounded-lg" />
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase font-bold">Organizer</p>
                                                <p className="text-gray-700 font-semibold">{event.organizer || "Admin"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        className="prose prose-blue max-w-none text-gray-700 leading-relaxed 
                                        prose-h2:text-2xl prose-h3:text-xl prose-p:mb-4 prose-strong:text-gray-900"
                                        dangerouslySetInnerHTML={{ __html: contentWithIds }}
                                    />

                                </div>
                            </article>
                        </main>

                        {/* RIGHT: SIDEBAR (TOC) */}
                        <aside className="lg:col-span-3">
                            <div className="sticky top-28 space-y-6">
                                {/* Height ko h-40 se badalkar max-h-[calc(100vh-120px)] kiya taaki screen ke hisaab se adjust ho */}
                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col max-h-[500px]">

                                    {/* Header static rahega */}
                                    <div className="flex items-center gap-3 mb-6 flex-shrink-0">
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <List className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-sm">Table of Contents</h3>
                                    </div>

                                    {/* Nav section scrollable banaya gaya hai */}
                                    <nav className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                                        {tocStructure.map((h2, i) => (
                                            <div key={i} className="flex flex-col border-b border-gray-50 last:border-0 pb-2">
                                                <button
                                                    onClick={() => {
                                                        handleScroll(h2.id);
                                                        toggleMenu(h2.id);
                                                    }}
                                                    className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl text-sm transition-all duration-300 group border-none cursor-pointer
                                                            ${openMenus[h2.id]
                                                            ? 'bg-blue-50 text-blue-700'
                                                            : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600 bg-transparent'
                                                        }`}
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
                                                    <div className="ml-7 mt-1 space-y-1 border-l-2 border-blue-100 pl-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                                        {h2.subheadings.map((h3, j) => (
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
                </div>
            </div>

            {/* RELATED EVENTS SECTION */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 border-t border-gray-100">
                <h2 className="text-3xl font-bold text-gray-900 mb-10">Other Events</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {relatedEvents.length > 0 ? (
                        relatedEvents.slice(0, 3).map((item) => (
                            <div
                                key={item._id || item.id}
                                className="group bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
                                onClick={() => {
                                    navigate(`/events/${item._id || item.id}`);
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                            >
                                <div className="h-52 overflow-hidden">
                                    <img src={item.image} alt={item.title} className="w-full h-full object-fill group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                        {item.title}
                                    </h3>
                                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                                        <Calendar className="w-4 h-4 text-blue-500" />
                                        <span>{item.date}</span>
                                    </div>
                                    <p>{item.description.slice(0,90)} ...</p>
                                    <div className="mt-4 flex items-center text-sm text-blue-600 font-bold">
                                        View Details <ChevronRight className="w-4 h-4 ml-1" />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-3 text-center py-10 text-gray-400 italic bg-gray-50 rounded-2xl border border-dashed">
                            No other events found.
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default EventDetails;