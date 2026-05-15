"use client"

import { useState, useMemo, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { FaUsers } from "react-icons/fa";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  ArrowRight,
  Sparkles,
} from "lucide-react"

// Components & Data
import Footer from "../components/Footer"
import { internshipData } from "../data/courses"
import { ContactPopup } from "../components/contacts/ContactPopup"
import CallingIcon from "../components/socialContact/Call"
import WhatsappIcon from "../components/socialContact/Whatsapp"

export default function Internships() {
  const [isContactPopupOpen, setIsContactPopupOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const itemsPerPage = 6

  const navigate = useNavigate()
  const internshipOnlineRef = useRef(null)

  // Navigate to Inquiry Form on click
  const handleInternshipClick = () => {
    navigate("/form")
  }

  const toggleContactPopup = () => setIsContactPopupOpen(!isContactPopupOpen)

  // Filter and search logic
  const filteredData = useMemo(() => {
    let filtered = internshipData
    if (selectedCategory !== "All") {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }
    return filtered
  }, [selectedCategory, searchQuery])

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  const handleSearchChange = (query) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    setIsLoading(true)
    setCurrentPage(page)
    setTimeout(() => {
      internshipOnlineRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
      setIsLoading(false)
    }, 100)
  }

  const getPageNumbers = () => {
    const pages = []
    for (let i = 1; i <= totalPages; i++) pages.push(i)
    return pages
  }

  return (
    <div className="bg-[#fcfcfd] min-h-screen font-sans text-slate-900">

      {/* --- PREMIUM HERO SECTION (Form Removed) --- */}
      {/* --- IMAGE BACKGROUND HERO SECTION --- */}
      <section className="relative h-[300px] md:h-[500px] flex items-center justify-center overflow-hidden">
        {/* Background Image Overlay */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url('/about.png')`, // Apni image ka path yahan dalein
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed' // Parallax effect ke liye
          }}
        >
          {/* Dark Overlay taaki text saaf dikhe */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-indigo-500/30">
            <Sparkles className="w-4 h-4" /> Limited Seats Available
          </div>

          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            Take the First Step Towards <br />
            <span className="text-indigo-400">Your Dream Career</span>
          </h2>

          <p className="text-slate-200 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-medium">
            Gai hands-on experience by working on real-world projects under the guidance of industry experts.
            Join our global community today.
          </p>

          <button
            onClick={() => navigate("/form")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-10 rounded-2xl shadow-2xl transition-all transform hover:-translate-y-1 hover:scale-105 flex items-center gap-2 mx-auto group"
          >
            Inquiry Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* --- INFO BAR --- */}
      {/* <div className="max-w-7xl mx-auto px-4 mb-20">
        <div className="bg-slate-900 rounded-[2rem] p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32" />

          <div className="relative z-10 text-center md:text-left">
            <h3 className="text-2xl font-bold mb-2">Remote Internships Available</h3>
            <p className="text-slate-400">Join our community of 10,000+ successful interns today.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="text-sm">Dehradun, India</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="text-sm">+91 8979891705</span>
            </div>
            <button
              onClick={toggleContactPopup}
              className="bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-3 rounded-xl font-bold transition-all"
            >
              Contact Us
            </button>
          </div>
        </div>
      </div> */}

      {/* --- INTERNSHIP EXPLORER --- */}
      <div ref={internshipOnlineRef} className="max-w-7xl mx-auto px-4 pb-32 scroll-mt-24 p-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
          <div>
            <h2 className="text-4xl font-black text-slate-900 mb-4">Explore Domains</h2>
            <div className="h-1.5 w-20 bg-indigo-600 rounded-full" />
          </div>

          {/* Search & Filter UI */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search domain..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
              />
            </div>
            <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit">
              {["All", "Technology", "Non-Technology"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${selectedCategory === cat
                    ? "bg-white text-indigo-600 shadow-md"
                    : "text-slate-500 hover:text-slate-900"
                    }`}
                >
                  {cat === "Non-Technology" ? "Non-Tech" : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid Section */}
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-3xl">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {paginatedData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedData.map((domain) => (
                <div
                  key={domain.id}
                  onClick={handleInternshipClick} // Opens /form route
                  className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-[0_30px_60px_rgba(79,70,229,0.12)] transition-all duration-500 cursor-pointer flex flex-col h-full relative"
                >
                  <div className="absolute top-5 right-5 z-10">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg ${domain.category === "Technology" ? "bg-indigo-600" : "bg-fuchsia-600"
                      }`}>
                      {domain.category === "Non-Technology" ? "Non-Tech" : "Tech"}
                    </span>
                  </div>

                  <div className="h-56 overflow-hidden">
                    <img
                      src={domain.image || "/placeholder.svg"}
                      alt={domain.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>

                  <div className="p-8 flex flex-col flex-grow">
                    <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                      {domain.title}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-3">
                      {domain.description}
                    </p>

                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-indigo-600 font-bold text-sm group-hover:translate-x-2 transition-transform">Apply Now</span>
                      <div className="h-12 w-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:rotate-[360deg] transition-all duration-700">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-slate-800">No Internships Found</h3>
              <p className="text-slate-500 mb-8">Try adjusting your search or filters.</p>
              <button onClick={() => { setSearchQuery(""); setSelectedCategory("All") }} className="text-indigo-600 font-bold hover:underline">
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* --- PAGINATION --- */}
        {totalPages > 1 && (
          <div className="mt-20 flex flex-col items-center gap-6">
            <div className="flex items-center gap-2 p-2 bg-white rounded-3xl shadow-xl border border-slate-100">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-4 rounded-2xl hover:bg-indigo-50 disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex gap-1">
                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' && handlePageChange(page)}
                    className={`min-w-[50px] h-[50px] rounded-2xl font-bold transition-all ${currentPage === page
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                      : "hover:bg-indigo-50 text-slate-600"
                      }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-4 rounded-2xl hover:bg-indigo-50 disabled:opacity-30 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <ContactPopup isOpen={isContactPopupOpen} onClose={toggleContactPopup} />
      <Footer />
      <CallingIcon />
      <WhatsappIcon />
    </div>
  )
}