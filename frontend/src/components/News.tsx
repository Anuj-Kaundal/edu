import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, Calendar, MoveUpRight } from "lucide-react";
import Footer from "./Footer";

type NewsType = {
    _id: string;
    title: string;
    excerpt: string;
    image: string;
    categories?: string[] | string;
    createdAt?: string;
    author?: string;
};

const News: React.FC = () => {
    const [newsList, setNewsList] = useState<NewsType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState<string>("");

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await axios.get("http://localhost:5000/shownew");
                setNewsList(res.data);
            } catch (err) {
                setError("Failed to fetch news updates.");
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    const filteredNews = newsList.filter((news) =>
        news.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Dynamic Tag Colors for professional look
    const tagColors = [
        "bg-red-100 text-red-600",
        "bg-blue-100 text-blue-600",
        "bg-slate-100 text-slate-600",
    ];

    if (loading) return <div className="text-center py-20 font-sans text-gray-500">Loading News Updates...</div>;

    return (
        <>
            <div className="min-h-screen bg-[#F9FBFF] font-sans pb-20">
                {/* Header Section */}
                <header className="pt-16 pb-12 px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] mt-20 mb-4">Latest News</h1>
                    <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto mb-10">
                        Stay updated with the latest happenings, industry news, and important announcements.
                    </p>

                    {/* Search Bar */}
                    <div className="relative max-w-2xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search news articles..."
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm bg-white"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </header>

                {/* News Grid - 2 Columns (Matching Blog Design) */}
                <main className="max-w-6xl mx-auto px-6 grid gap-10 md:grid-cols-2">
                    {filteredNews.map((item) => {
                        // Handle categories safely
                        let categories: string[] = [];
                        if (item.categories) {
                            categories = typeof item.categories === "string" ? JSON.parse(item.categories) : item.categories;
                        } else {
                            categories = ["Breaking News"]; // Default tag
                        }

                        return (
                            <div key={item._id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-400 flex flex-col group">
                                {/* Card Image */}
                                <div className="relative h-60 overflow-hidden">
                                    <img
                                        src={item.image || "https://via.placeholder.com/600x400"}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                </div>

                                {/* Card Content */}
                                <div className="p-8 flex flex-col flex-grow">
                                    {/* Date */}
                                    <div className="flex items-center text-gray-400 text-xs font-medium mb-3 uppercase tracking-wider">
                                        <Calendar className="w-4 h-4 mr-1.5" />
                                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB', {
                                            day: '2-digit', month: 'long', year: 'numeric'
                                        }) : "Recent News"}
                                    </div>

                                    {/* Title & Icon */}
                                    <div className="flex justify-between items-start mb-2 group-hover:text-blue-600 transition-colors cursor-pointer">
                                        <h2 className="text-xl font-bold text-[#1E293B] leading-snug pr-4">
                                            {item.title}
                                        </h2>
                                        <MoveUpRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 transition-colors shrink-0" />
                                    </div>

                                    {/* Author/Source */}
                                    <p className="text-sm text-gray-400 mb-4 font-medium">
                                        By {item.author || "News Desk | Novanectar"}
                                    </p>

                                    {/* Excerpt */}
                                    <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">
                                        {item.excerpt || "Stay informed with our latest news coverage and in-depth reporting on current events."}
                                    </p>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2 mt-auto">
                                        {categories.map((cat: string, index: number) => (
                                            <span
                                                key={index}
                                                className={`${tagColors[index % tagColors.length]} px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-tight`}
                                            >
                                                {cat}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </main>

                {/* Empty State */}
                {!loading && filteredNews.length === 0 && (
                    <div className="text-center mt-20 text-gray-400 italic">
                        No news articles found for "{searchTerm}"
                    </div>
                )}
            </div>
            <Footer/>
        </>
    );
};

export default News;