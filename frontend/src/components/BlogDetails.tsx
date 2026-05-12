import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, User, List, ArrowLeft, ChevronDown, ChevronRight } from "lucide-react";
import Footer from "./Footer";

const BlogDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [relatedBlogs, setRelatedBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openMenus, setOpenMenus] = useState({});

    useEffect(() => {
        window.scrollTo(0, 0);

        const fetchData = async () => {
            try {
                setLoading(true);
                const blogRes = await axios.get(`http://localhost:5000/blog/${id}`);
                const currentBlog = blogRes.data;
                setBlog(currentBlog);

                const allRes = await axios.get("http://localhost:5000/blog");
                const allData = allRes.data;

                // Categories normalization logic
                let currentCats = [];
                try {
                    currentCats = typeof currentBlog.categories === "string"
                        ? JSON.parse(currentBlog.categories)
                        : (Array.isArray(currentBlog.categories) ? currentBlog.categories : []);
                } catch (e) {
                    currentCats = currentBlog.categories?.split(",").map(c => c.trim()) || [];
                }

                const filtered = allData.filter(item => {
                    if (item._id === id) return false;
                    let itemCats = [];
                    try {
                        itemCats = typeof item.categories === "string"
                            ? JSON.parse(item.categories)
                            : (Array.isArray(item.categories) ? item.categories : []);
                    } catch (e) {
                        itemCats = item.categories?.split(",").map(c => c.trim()) || [];
                    }
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

    // --- NESTED TOC LOGIC ---
    const rawContent = blog.content || blog.description || "";
    const tocStructure = [];
    let lastH2 = null;

    const descriptionWithIds = rawContent.replace(/<(h[23])>(.*?)<\/\1>/g, (match, tag, text) => {
        const cleanText = text.replace(/<[^>]*>?/gm, '');
        const headingId = cleanText.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");

        if (tag === 'h2') {
            lastH2 = { text: cleanText, id: headingId, subheadings: [] };
            tocStructure.push(lastH2);
        } else if (tag === 'h3' && lastH2) {
            lastH2.subheadings.push({ text: cleanText, id: headingId });
        }

        return `<${tag} id="${headingId}" class="scroll-mt-24 font-bold text-gray-900 mt-8 mb-4">${text}</${tag}>`;
    });

    const handleScroll = (targetId) => {
        const element = document.getElementById(targetId);
        if (element) {
            window.scrollTo({ top: element.offsetTop - 100, behavior: "smooth" });
        }
    };

    const toggleMenu = (h2Id) => {
        setOpenMenus(prev => ({ ...prev, [h2Id]: !prev[h2Id] }));
    };

    const handleH2Click = (h2Id) => {
        handleScroll(h2Id);
        toggleMenu(h2Id);
    };

    return (
        <>
            <div className="bg-[#F8FAFC] min-h-screen pb-20">
                <div className="h-24"></div>

                <div className="w-full  px-4 md:px-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-8 group bg-transparent border-none cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-semibold">Back to Blog</span>
                    </button>

                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* LEFT: MAIN CONTENT */}
                        <main className="lg:w-[1000px]">
                            <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <img src={blog.image} alt={blog.title} className="w-full lg:h-[400px] object-fill" />

                                <div className="p-8 md:p-12">
                                    <h1 className="text-xl md:text-3xl font-extrabold text-gray-900 mb-6 leading-tight">
                                        {blog.title}
                                    </h1>

                                    <div className="flex items-center gap-6 text-gray-400 text-sm mb-8 pb-8 border-b border-gray-50">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-blue-500" />
                                            <span className="font-semibold text-gray-700">{blog.author || "Admin"}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-blue-500" />
                                            <span className="font-semibold text-gray-700">
                                                {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString("en-GB", {
                                                    day: "2-digit", month: "short", year: "numeric",
                                                }) : ""}
                                            </span>
                                        </div>
                                    </div>

                                    <div
                                        className="prose prose-blue max-w-none text-gray-700 leading-relaxed 
                                        prose-h2:text-2xl prose-h3:text-xl prose-p:mb-4 prose-strong:text-gray-900"
                                        dangerouslySetInnerHTML={{ __html: descriptionWithIds }}
                                    />
                                </div>
                            </article>
                        </main>

                        {/* RIGHT: SIDEBAR (ACCORDION TOC) */}
                        <aside className="lg:w-1/4">
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
                                                {/* H2 Heading Button (Clickable Bar) */}
                                                <button
                                                    onClick={() => handleH2Click(h2.id)}
                                                    className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl text-sm transition-all duration-300 group border-none cursor-pointer
                                                        ${openMenus[h2.id] ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600 bg-transparent'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${openMenus[h2.id] ? 'bg-blue-600' : 'bg-gray-300'}`}></span>
                                                        <span className="font-bold text-left line-clamp-1">{h2.text}</span>
                                                    </div>
                                                    {h2.subheadings.length > 0 && (
                                                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${openMenus[h2.id] ? 'rotate-180' : ''}`} />
                                                    )}
                                                </button>

                                                {/* H3 Subheadings (Dropdown) */}
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

            {/* RELATED BLOGS SECTION */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 border-t border-gray-100">
                <h2 className="text-3xl font-bold text-gray-900 mb-10">Related Blogs</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {relatedBlogs.length > 0 ? (
                        relatedBlogs.slice(0, 3).map((item) => (
                            <div
                                key={item._id}
                                className="group bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
                                onClick={() => {
                                    navigate(`/blogdetails/${item._id}`); // Route match according to your routes.tsx
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                            >
                                <div className="h-52 overflow-hidden">
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
                        <div className="col-span-3 text-center py-10 text-gray-400 italic bg-gray-50 rounded-2xl border border-dashed">
                            No related articles found.
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default BlogDetails;