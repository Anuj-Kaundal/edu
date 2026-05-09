import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, Calendar } from "lucide-react";
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";

type EventType = {
    _id: string;
    title: string;
    image: string;
    author?: string;
    date?: string;
    content?: string;
};

const Event: React.FC = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState<EventType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>("");

    useEffect(() => {
        axios
            .get("http://localhost:5000/showevent")
            .then((res) => setEvents(res.data))
            .catch(() => console.log("Error fetching events"))
            .finally(() => setLoading(false));
    }, []);

    const filteredEvents = events.filter((event) =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading)
        return (
            <div className="text-center py-20 text-gray-500">
                Loading Event Calendar...
            </div>
        );

    return (
        <>
            <div className="min-h-screen bg-[#F9FBFF] pb-20">

                {/* Header */}
                <header className="pt-16 pb-12 px-4 text-center">
                    <h1 className="text-4xl font-bold mt-20 mb-4">
                        Upcoming Events
                    </h1>

                    <div className="relative max-w-2xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search events..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl border"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </header>

                {/* Grid */}
                <main className="max-w-6xl mx-auto px-6 grid gap-10 md:grid-cols-2">
                    {filteredEvents.map((event) => (
                        <div
                            key={event._id}
                            className="bg-white rounded-xl cursor-pointer shadow hover:shadow-xl transition overflow-hidden" onClick={() => navigate(`/eventdetails/${event._id}`)}>

                            {/* Image */}
                            <img
                                src={event.image}
                                alt=""
                                className="w-full h-60 object-fill"
                            />

                            {/* Content */}
                            <div className="p-6">

                                {/* Date */}
                                <div className="flex items-center text-gray-400 text-xs mb-2">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    {event.date}
                                </div>

                                {/* Title */}
                                <h2 className="text-xl font-bold mb-2 text-gray-800">
                                    {event.title}
                                </h2>

                                {/* Author */}
                                <p className="text-sm text-gray-500 mb-4">
                                    By {event.author || "Admin"}
                                </p>

                                {/* Content Preview */}
                                <div
                                    className="prose max-w-none mt-5 space-y-5 line-clamp-4"
                                    dangerouslySetInnerHTML={{
                                        __html: event.content
                                    }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </main>

                {/* Empty */}
                {filteredEvents.length === 0 && (
                    <div className="text-center mt-20 text-gray-400">
                        No events found
                    </div>
                )}
            </div>

            <Footer />
        </>
    );
};

export default Event;