import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, Calendar, MapPin, MoveUpRight, Ticket } from "lucide-react";
import Footer from "./Footer";

type EventType = {
    _id: string;
    title: string;
    excerpt: string;
    image: string;
    createdAt?: string;
    location?: string;
    status?: string;
};

const Event: React.FC = () => {
    const [events, setEvents] = useState<EventType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState<string>("");

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await axios.get("http://localhost:5000/showevent");
                setEvents(res.data);
            } catch (err) {
                setError("Failed to fetch upcoming events.");
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const filteredEvents = events.filter((event) =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="text-center py-20 font-sans text-gray-500">Loading Event Calendar...</div>;

    return (
        <>
            <div className="min-h-screen bg-[#F9FBFF] font-sans pb-20">
                {/* Header Section */}
                <header className="pt-16 pb-12 px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] mt-20 mb-4">Upcoming Events</h1>
                    <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto mb-10">
                        Join our exclusive webinars, workshops, and networking sessions to grow your career.
                    </p>

                    {/* Search Bar - Matching Blog/News */}
                    <div className="relative max-w-2xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search events..."
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm bg-white"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </header>

                {/* Event Grid - 2 Columns (Matching Blog/News) */}
                <main className="max-w-6xl mx-auto px-6 grid gap-10 md:grid-cols-2">
                    {filteredEvents.map((event) => (
                        <div key={event._id} className="bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col group">
                            
                            {/* Card Image & Badge */}
                            <div className="relative h-60 overflow-hidden">
                                <img
                                    src={event.image || "https://via.placeholder.com/600x400"}
                                    alt={event.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute top-4 right-6 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-[11px] font-bold text-blue-600 shadow-sm uppercase tracking-wider">
                                    Registration Open
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-8 flex flex-col flex-grow">
                                
                                {/* Date & Location */}
                                <div className="flex flex-wrap items-center gap-4 text-gray-400 text-xs font-medium mb-3 uppercase tracking-wider">
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-1.5 text-blue-500" />
                                        {event.createdAt ? new Date(event.createdAt).toLocaleDateString('en-GB', {
                                            day: '2-digit', month: 'long', year: 'numeric'
                                        }) : "Coming Soon"}
                                    </div>
                                    <div className="flex items-center">
                                        <MapPin className="w-4 h-4 mr-1.5 text-blue-500" />
                                        {event.location || "Online / Venue"}
                                    </div>
                                </div>

                                {/* Title & Icon */}
                                <div className="flex justify-between items-start mb-3 group-hover:text-blue-600 transition-colors cursor-pointer">
                                    <h2 className="text-xl font-bold text-[#1E293B] leading-snug pr-4">
                                        {event.title}
                                    </h2>
                                    <MoveUpRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 transition-colors shrink-0" />
                                </div>

                                {/* Excerpt */}
                                <p className="text-gray-500 text-sm leading-relaxed mb-8 line-clamp-3">
                                    {event.excerpt || "Join us for an insightful session where industry experts share their knowledge and experience."}
                                </p>

                                {/* Bottom Action Section */}
                                <div className="mt-auto flex items-center justify-between pt-5 border-t border-gray-50">
                                    <div className="flex items-center text-gray-400 text-xs font-semibold">
                                        <Ticket className="w-4 h-4 mr-2" />
                                        LIMITED SEATS
                                    </div>
                                    <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs hover:bg-blue-700 transition-all shadow-md shadow-blue-100 flex items-center gap-2">
                                        JOIN NOW
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </main>

                {/* Empty State */}
                {!loading && filteredEvents.length === 0 && (
                    <div className="text-center mt-20 text-gray-400 italic">
                        No events found for "{searchTerm}"
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
};

export default Event;