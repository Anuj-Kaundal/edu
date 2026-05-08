import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronRight, Calendar, User, List, ArrowLeft } from "lucide-react";
import Footer from "./Footer";

const BlogDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [relatedBlogs, setRelatedBlogs] = useState([]); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        
        const fetchData = async () => {
            try {
                setLoading(true);
                // 1. Current blog fetch karein
                const blogRes = await axios.get(`http://localhost:5000/blog/${id}`);
                const currentBlog = blogRes.data;
                setBlog(currentBlog);

                // 2. All blogs fetch karein related filtering ke liye
                const allRes = await axios.get("http://localhost:5000/blog");
                const allData = allRes.data;

                // 3. Category matching logic
                let currentCats = [];
                try {
                    currentCats = typeof currentBlog.categories === "string" 
                        ? JSON.parse(currentBlog.categories) 
                        : (Array.isArray(currentBlog.categories) ? currentBlog.categories : []);
                } catch(e) {
                    currentCats = currentBlog.categories?.split(",").map(c => c.trim()) || [];
                }

                const filtered = allData.filter(item => {
                    if (item._id === id) return false; // Current blog hide karein

                    let itemCats = [];
                    try {
                        itemCats = typeof item.categories === "string" 
                            ? JSON.parse(item.categories) 
                            : (Array.isArray(item.categories) ? item.categories : []);
                    } catch(e) {
                        itemCats = item.categories?.split(",").map(c => c.trim()) || [];
                    }

                    // Check matching category
                    return itemCats.some(cat => currentCats.includes(cat));
                });

                setRelatedBlogs(filtered);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching blog details:", err);
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading)
        return (
            <div className="flex justify-center items-center h-screen text-gray-400">
                <div className="animate-pulse font-medium">Loading Article...</div>
            </div>
        );

    if (!blog) return <div className="text-center py-20 font-bold">Blog Not Found!</div>;

    // --- TOC & Content Logic ---
    const rawContent = blog.content || blog.description || "";
    const headings = [];
    const descriptionWithIds = rawContent.replace(/<(h[23])>(.*?)<\/\1>/g, (match, tag, text) => {
        const headingId = text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
        headings.push({ text: text.replace(/<[^>]*>?/gm, ''), id: headingId });
        return `<${tag} id="${headingId}" class="scroll-mt-24 font-bold text-gray-900 mt-8 mb-4">${text}</${tag}>`;
    });

    const handleScroll = (targetId) => {
        const element = document.getElementById(targetId);
        if (element) {
            window.scrollTo({ top: element.offsetTop - 100, behavior: "smooth" });
        }
    };

    return (
        <>
            <div className="bg-[#F8FAFC] min-h-screen pb-20">
                <div className="h-20"></div>

                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    {/* Back Navigation */}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-8 group bg-transparent border-none cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-semibold">Back to Blog</span>
                    </button>

                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* LEFT: MAIN CONTENT */}
                        <main className="lg:w-2/3">
                            <article className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                <img src={blog.image} alt={blog.title} className="w-full h-[450px] object-cover" />

                                <div className="p-8 md:p-12">
                                    <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                                        {blog.title}
                                    </h1>

                                    <div className="flex items-center gap-6 text-gray-400 text-sm mb-10 pb-8 border-b">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-blue-500" />
                                            <span className="font-medium text-gray-700">{blog.author || "Admin"}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-blue-500" />
                                            <span className="font-medium">{new Date(blog.date).toDateString()}</span>
                                        </div>
                                    </div>

                                    {/* Main Blog Content Render */}
                                    <div
                                        className="prose prose-blue max-w-none text-gray-700 leading-relaxed 
                                        prose-p:mb-5 prose-li:mb-2 prose-strong:text-gray-900"
                                        dangerouslySetInnerHTML={{ __html: descriptionWithIds }}
                                    />
                                </div>
                            </article>
                        </main>

                        {/* RIGHT: SIDEBAR */}
                        <aside className="lg:w-1/3">
                            <div className="sticky top-28 space-y-6">
                                <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-3 mb-6">
                                        <List className="w-5 h-5 text-blue-600" />
                                        <h3 className="font-bold text-gray-900 text-lg">Table of Contents</h3>
                                    </div>

                                    <nav className="space-y-1">
                                        {headings.map((h, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleScroll(h.id)}
                                                className="w-full text-left py-2.5 px-4 rounded-xl text-sm text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all flex items-center gap-3 bg-transparent border-none cursor-pointer"
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                                <span className="line-clamp-1">{h.text}</span>
                                            </button>
                                        ))}
                                        {headings.length === 0 && <p className="text-gray-400 text-sm italic">No sections found.</p>}
                                    </nav>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>

            {/* RELATED BLOGS SECTION (CATEGORY BASED) */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 border-t border-gray-100">
                <h2 className="text-3xl font-bold text-gray-900 mb-10">Related Articles</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {relatedBlogs.length > 0 ? (
                        relatedBlogs.slice(0, 3).map((item) => (
                            <div
                                key={item._id}
                                className="group bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                onClick={() => navigate(`/blog/${item._id}`)}
                            >
                                <div className="relative h-52 overflow-hidden">
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                        {item.title}
                                    </h3>
                                    <div className="mt-4 flex items-center text-sm text-gray-500 font-medium">
                                        Read Article <ChevronRight className="w-4 h-4 text-blue-600 ml-1" />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-3 text-center py-10 text-gray-400 italic bg-gray-50 rounded-2xl">
                            No related articles found in this category.
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default BlogDetails;