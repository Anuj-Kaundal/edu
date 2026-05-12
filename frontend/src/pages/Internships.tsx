"use client"

import { useState, useMemo, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { FaUsers } from "react-icons/fa";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  MapPin, 
  Phone, 
  Filter, 
  ArrowRight, 
  Sparkles,
  Zap
} from "lucide-react"

// Components & Data
import Footer from "../components/Footer"
import { internshipData } from "../data/courses"
import { ContactPopup } from "../components/contacts/ContactPopup"
import CallingIcon from "../components/socialContact/Call"
import WhatsappIcon from "../components/socialContact/Whatsapp"

export default function Internships() {
  const [hoveredCard, setHoveredCard] = useState<number | string | null>(null)
  const [isContactPopupOpen, setIsContactPopupOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [isLoading, setIsLoading] = useState(false)
  const itemsPerPage = 6

  const navigate = useNavigate()
  const internshipOnlineRef = useRef<HTMLDivElement>(null)

  const handleInternshipClick = (courseId: string) => {
    navigate(`/internships/${courseId}`)
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

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
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
    const maxVisiblePages = 5
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages)
      }
    }
    return pages
  }

  return (
    <div className="bg-[#fcfcfd] min-h-screen font-sans text-slate-900">
      {/* --- PREMIUM HERO SECTION --- */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-indigo-50/50 to-transparent -z-10" />
        
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
            
            {/* Form Side */}
            <div className="p-10 lg:p-16 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-6 w-fit">
                <Sparkles className="w-4 h-4" /> Build Your Future
              </div>
              <h1 className="text-4xl lg:text-5xl font-black mb-6 leading-[1.1]">
                Kickstart Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                  Professional Journey
                </span>
              </h1>
              <p className="text-slate-500 text-lg mb-8 max-w-md">
                Apply for our premium online internships and gain hands-on experience with industry experts.
              </p>

              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 group">
                  Apply Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>

            {/* Image Side */}
            <div className="relative min-h-[400px] lg:min-h-full bg-indigo-50">
              <img
                src="/onlineinternship.png"
                alt="Internship"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent lg:from-transparent" />
              {/* Floating Card UI */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur p-6 rounded-3xl shadow-2xl border border-white/20 hidden md:block">
  <div className="flex items-center gap-4">
    <div className="h-10 w-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
      <FaUsers className="w-6 h-6" />
    </div>
    <div>
      <p className="text-sm font-bold">10K+</p>
      <p className="text-xs text-slate-500 font-bold">Online Students</p>
    </div>
  </div>
</div>
            </div>
          </div>
        </div>
      </section>

      {/* --- INFO BAR --- */}
      <div className="max-w-7xl mx-auto px-4 mb-20">
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
      </div>

      {/* --- INTERNSHIP EXPLORER --- */}
      <div ref={internshipOnlineRef} className="max-w-7xl mx-auto px-4 pb-32 scroll-mt-24">
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
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    selectedCategory === cat 
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
                  onClick={() => handleInternshipClick(domain.id)}
                  onMouseEnter={() => setHoveredCard(domain.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-[0_30px_60px_rgba(79,70,229,0.12)] transition-all duration-500 cursor-pointer flex flex-col h-full relative"
                >
                  {/* Category Badge */}
                  <div className="absolute top-5 right-5 z-10">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg ${
                      domain.category === "Technology" ? "bg-indigo-600" : "bg-fuchsia-600"
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
                      <div className="flex -space-x-3">
                        {domain.logos?.slice(0, 3).map((logo, i) => (
                          <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-50 p-1.5 shadow-sm">
                            <img src={logo} alt="tech" className="w-full h-full object-contain" />
                          </div>
                        ))}
                      </div>
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
              <button onClick={() => {setSearchQuery(""); setSelectedCategory("All")}} className="text-indigo-600 font-bold hover:underline">
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
                    disabled={page === "..."}
                    className={`min-w-[50px] h-[50px] rounded-2xl font-bold transition-all ${
                      currentPage === page 
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