import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
    Calendar,
    User,
    List,
    ArrowLeft,
    MapPin
} from "lucide-react";
import Footer from "./Footer";

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [event, setEvent] = useState<any>(null);
    const [allEvents, setAllEvents] = useState<any[]>([]);

    useEffect(() => {
        // Fetch Current Event
        axios
            .get(`http://localhost:5000/events/${id}`)
            .then((res) => {
                console.log("CURRENT EVENT =>", res.data);
                setEvent(res.data);
            })
            .catch((err) => console.log(err));

        // Fetch All Events
        axios
            .get("http://localhost:5000/event")
            .then((res) => {
                console.log("ALL EVENTS =>", res.data);

                // Handle every possible API structure
                const eventsData =
                    res.data.events ||
                    res.data.data ||
                    res.data;

                setAllEvents(
                    Array.isArray(eventsData)
                        ? eventsData
                        : []
                );
            })
            .catch((err) => console.log(err));

    }, [id]);

    // Loading
    if (!event) {
        return (
            <div className="flex justify-center items-center h-screen text-gray-500">
                Loading Event...
            </div>
        );
    }

    // Hide Current Event
    const relatedEvents = Array.isArray(allEvents)
        ? allEvents.filter(
            (item) =>
                String(item._id || item.id) !==
                String(event._id || event.id)
        )
        : [];

    console.log("RELATED EVENTS =>", relatedEvents);

    // Content + headings
    const rawContent = event.content || event.description || "";
    const headings: any[] = [];

    const contentWithIds = rawContent.replace(
        /<(h[23])>(.*?)<\/\1>/g,
        (match: any, tag: any, text: any) => {
            const cleanText = text.replace(/<[^>]*>?/gm, "");

            const headingId = cleanText
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^\w-]/g, "");

            headings.push({
                text: cleanText,
                id: headingId
            });

            return `
        <${tag}
          id="${headingId}"
          class="scroll-mt-24 font-bold text-gray-900 mt-8 mb-4"
        >
          ${text}
        </${tag}>
      `;
        }
    );

    // Smooth Scroll
    const handleScroll = (elementId: string) => {
        const element = document.getElementById(elementId);

        if (element) {
            window.scrollTo({
                top: element.offsetTop - 100,
                behavior: "smooth"
            });
        }
    };

    return (
        <>
            <div className="bg-[#F8FAFC] min-h-screen pb-20">

                <div className="h-24"></div>

                <div className="max-w-7xl mx-auto px-4 md:px-6">

                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Events</span>
                    </button>

                    <div className="flex flex-col lg:flex-row gap-12">

                        {/* LEFT CONTENT */}
                        <main className="lg:w-2/3">

                            <article className="bg-white rounded-3xl shadow-sm overflow-hidden">

                                {/* Image */}
                                <div className="w-full h-[400px] overflow-hidden">
                                    <img
                                        src={event.image}
                                        alt={event.title}
                                        className="w-full h-full object-fill"
                                    />
                                </div>

                                {/* Content */}
                                <div className="p-8 md:p-12">

                                    {/* Title */}
                                    <h1 className="text-xl md:text-3xl font-extrabold text-gray-900 mb-6 leading-tight">
                                        {event.title}
                                    </h1>

                                    {/* Meta */}
                                    <div className="flex flex-wrap items-center gap-6 text-sm mb-8 pb-8 border-b">

                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-orange-500" />
                                            <span>
                                                {event.organizer || "Admin"}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-orange-500" />
                                            <span>{event.date}</span>
                                        </div>

                                        {/* {event.location && (
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-orange-500" />
                                                <span>{event.location}</span>
                                            </div>
                                        )} */}
                                    </div>

                                    {/* Body */}
                                    <div
                                        className="prose max-w-none text-gray-700"
                                        dangerouslySetInnerHTML={{
                                            __html: contentWithIds
                                        }}
                                    />

                                </div>
                            </article>
                        </main>

                        {/* RIGHT SIDEBAR */}
                        <aside className="lg:w-1/3">

                            <div className="sticky top-28 bg-white p-8 rounded-3xl shadow-sm">

                                <div className="flex items-center gap-3 mb-6">
                                    <List className="w-5 h-5 text-blue-600" />

                                    <h3 className="font-bold text-lg">
                                        Table of Contents
                                    </h3>
                                </div>

                                <nav className="space-y-2">

                                    {headings.length > 0 ? (
                                        headings.map((h, i) => (
                                            <button
                                                key={i}
                                                onClick={() =>
                                                    handleScroll(h.id)
                                                }
                                                className="block w-full text-left px-4 py-2 font-bold text-gray-500 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition"
                                            >
                                                {h.text}
                                            </button>
                                        ))
                                    ) : (
                                        <p className="text-gray-400 text-sm">
                                            No sections found.
                                        </p>
                                    )}

                                </nav>
                            </div>
                        </aside>
                    </div>

                    {/* OTHER EVENTS */}
                    <div className="mt-20">

                        <h2 className="text-3xl font-bold mb-10">
                            Other Events
                        </h2>

                        {relatedEvents.length > 0 ? (

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

                                {relatedEvents.map((item) => (

                                    <div
                                        key={item._id || item.id}
                                        onClick={() =>
                                            navigate(
                                                `/events/${item._id || item.id}`
                                            )
                                        }
                                        className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-lg transition duration-300 cursor-pointer"
                                    >

                                        {/* Image */}
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="w-full h-56 object-cover"
                                        />

                                        {/* Content */}
                                        <div className="p-5">

                                            <h3 className="text-xl font-semibold mb-3 line-clamp-2">
                                                {item.title}
                                            </h3>

                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Calendar className="w-4 h-4" />
                                                <span>{item.date}</span>
                                            </div>
                                            <div
                                                className="prose max-w-none text-gray-700 line-clamp-3"
                                                dangerouslySetInnerHTML={{
                                                    __html: contentWithIds
                                                }}
                                            />

                                        </div>
                                    </div>

                                ))}

                            </div>

                        ) : (

                            <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
                                <p className="text-gray-500 text-lg">
                                    No other events found.
                                </p>
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