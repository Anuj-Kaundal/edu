import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Footer from "./Footer";

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState<any>(null);

    useEffect(() => {
        axios
            .get(`http://localhost:5000/events/${id}`)
            .then((res) => setEvent(res.data))
            .catch(() => console.log("Error fetching event"));
    }, [id]);

    if (!event)
        return (
            <div className="flex justify-center items-center h-screen text-gray-500 text-lg">
                Loading...
            </div>
        );

    return (
        <>
            <div className="bg-gray-100 min-h-screen py-10 px-4">
                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden mt-20">

                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="text-blue-600 text-sm px-6 pt-6 font-semibold hover:underline"
                    >
                        ← Back to events
                    </button>

                    {/* Image */}
                    <div className="flex justify-center mt-5">
                        <img
                            src={event.image}
                            alt=""
                            className="w-fit h-72 object-cover rounded-lg"
                        />
                    </div>

                    {/* Content */}
                    <div className="px-6 md:px-10 py-8">

                        {/* Meta */}
                        <div className="flex justify-between text-sm text-gray-900 mb-4">
                            <span className="font-medium text-gray-700">
                                {event.organizer || "Admin"}
                            </span>
                            <span>{event.date}</span>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                            {event.title}
                        </h1>

                        {/* Location */}
                        {event.location && (
                            <p className="text-gray-600 mb-4">
                                📍 {event.location}
                            </p>
                        )}

                        {/* Description */}
                        <p>{event.description}</p>

                        {/* HTML Content */}
                        <div
                            className="prose max-w-none mt-5 space-y-5"
                            dangerouslySetInnerHTML={{
                                __html: event.content
                            }}
                        ></div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default EventDetails;