import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronRight, Calendar, User, List, ArrowLeft } from "lucide-react";
import Footer from "./Footer";

const NewsDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [news, setNews] = useState(null);
    const [allNews, setAllNews] = useState([]);
    const [allBlogs, setAllBlogs] = useState([]);

    useEffect(() => {
        // 1. Fetch Single News
        axios.get(`http://localhost:5000/news/${id}`)
            .then((res) => setNews(res.data))
            .catch(() => console.log("Error fetching news"));

        // 2. Fetch All News (Related section ke liye)
        axios.get("http://localhost:5000/news")
            .then((res) => setAllNews(res.data))
            .catch(() => console.log("Error fetching all news"));
    }, [id]);

    if (!news)
        return (
            <div className="flex justify-center items-center h-screen text-gray-400 font-medium animate-pulse">
                Loading Latest News...
            </div>
        );

    // --- TOC & ID INJECTION LOGIC ---
    const rawContent = news.content || news.description || "";
    const headings = [];

    // Content mein se <h2> aur <h3> dhoond kar unme unique IDs daalna
    const contentWithIds = rawContent.replace(/<(h[23])>(.*?)<\/\1>/g, (match, tag, text) => {
        const cleanText = text.replace(/<[^>]*>?/gm, '');
        const headingId = cleanText.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");

        headings.push({ text: cleanText, id: headingId });

        return `<${tag} id="${headingId}" class="scroll-mt-24 font-bold text-gray-900 mt-8 mb-4">${text}</${tag}>`;
    });

    const handleScroll = (elementId) => {
        const element = document.getElementById(elementId);
        if (element) {
            window.scrollTo({
                top: element.offsetTop - 100,
                behavior: "smooth"
            });
        }
    };
    // fetch related news
    // Frontend useEffect mein check karein
    axios.get("http://localhost:5000/news")
        .then((res) => {
            setAllNews(res.data); // Ab ye data fetch karega aur Related News dikhayega!
        });
    return (
        <>
            <div className="bg-[#F8FAFC] min-h-screen pb-20">
                <div className="h-24"></div>

                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-8 group cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-semibold">Back to News</span>
                    </button>

                    <div className="flex flex-col lg:flex-row gap-12">

                        {/* LEFT: Main News Content */}
                        <main className="lg:w-2/3">
                            <article className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="w-full h-[400px] overflow-hidden">
                                    <img src={news.image} alt={news.title} className="w-full h-full object-fill" />
                                </div>

                                <div className="p-8 md:p-12">
                                    <h1 className="text-xl md:text-3xl font-extrabold text-gray-900 mb-6 leading-tight">
                                        {news.title}
                                    </h1>

                                    <div className="flex items-center gap-6 text-gray-400 text-sm mb-8 pb-8 border-b border-gray-50">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-blue-500" />
                                            <span className="font-medium text-gray-700">{news.author || "Novanectar"}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-blue-500" />
                                            <span className="font-medium">{news.date}</span>
                                        </div>
                                    </div>

                                    {/* Main Body */}
                                    <div
                                        className="prose prose-blue max-w-none text-gray-700 leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: contentWithIds }}
                                    />
                                </div>
                            </article>
                        </main>

                        {/* RIGHT: Sidebar (Table of Contents) */}
                        <aside className="lg:w-1/3">
                            <div className="sticky top-28 space-y-6">
                                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <List className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-lg">Quick Summary</h3>
                                    </div>

                                    <nav className="space-y-1">
                                        {headings.map((h, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleScroll(h.id)}
                                                className="w-full text-left py-2.5 px-4 rounded-xl text-sm font-bold text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all flex items-center gap-3 group cursor-pointer"
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-blue-600 transition-colors"></span>
                                                <span className="line-clamp-1">{h.text}</span>
                                            </button>
                                        ))}
                                        {headings.length === 0 && <p className="text-gray-400 text-sm italic text-center">No highlights available.</p>}
                                    </nav>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>

                {/* --- RELATED NEWS SECTION (FILTERED) --- */}
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-20 mt-10 border-t border-gray-100">
                    <h2 className="text-3xl font-bold text-gray-900 mb-10">Related News</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {(() => {
                            // Helper function to clean and normalize tags
                            const normalize = (cat) => String(cat || "").trim().toLowerCase();

                            // 1. Current news ki categories normalize karein
                            const currentCats = (Array.isArray(news?.category) ? news.category : [news?.category])
                                .map(normalize);

                            // 2. Filter Logic
                            const relatedNews = allNews.filter(item => {
                                if (item._id === id) return false;

                                const itemCats = (Array.isArray(item.category) ? item.category : [item.category])
                                    .map(normalize);

                                // Intersection check
                                return itemCats.some(cat => currentCats.includes(cat));
                            });

                            // 3. Render
                            if (relatedNews.length > 0) {
                                return relatedNews.slice(0, 3).map(item => (
                                    <div
                                        key={item._id}
                                        className="group bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
                                        onClick={() => {
                                            navigate(`/news/${item._id}`);
                                            window.scrollTo({ top: 0, behavior: "smooth" });
                                        }}
                                    >
                                        <div className="h-52 overflow-hidden">
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="p-6">
                                            <div className="flex gap-2 mb-2">
                                                {(Array.isArray(item.category) ? item.category : [item.category]).map((c, i) => (
                                                    <span key={i} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase">
                                                        {c}
                                                    </span>
                                                ))}
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                {item.title}
                                            </h3>
                                            <p className="line-clamp-3 mt-2">{item.description}</p>
                                        </div>
                                    </div>
                                ));
                            } else {
                                return (
                                    <div className="col-span-full text-center py-10 text-gray-400 italic bg-gray-50 rounded-2xl border border-dashed">
                                        No similar articles found. Showing latest instead...
                                        {/* Option: Yahan allNews.slice(0,3) dikha sakte hain agar khali nahi rakhna */}
                                    </div>
                                );
                            }
                        })()}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default NewsDetails;