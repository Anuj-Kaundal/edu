import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/nav-logo.png";
import { useAuth } from "../hooks/useAuth";
import { ChevronDown } from "lucide-react"; // Arrow icon ke liye

const Layout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false); // Dropdown state
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsHovered(false);
  }, [location]);

  const navItems = [
    { to: "/", label: "Home" },
    { to: "/courses", label: "Courses" },
    { 
      label: "Internships", 
      isDropdown: true, 
      subItems: [
        { to: "/online-internship", label: "Online Internship" },
        { to: "/offline-internship", label: "Offline Internship" }
      ] 
    },
    { to: "/contact-us", label: "Contact Us" },
    { to: "/about-us", label: "About Us" },
    { to: "/session-book", label: "Free Consulting" },
  ];

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-24 z-40" />

      <header className="fixed top-0 left-0 right-0 z-50 px-4">
        <nav className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-[2px_2px_10px_rgba(0,0,0,0.1)] border border-gray-100 px-6 py-3">
            
            {/* Desktop View */}
            <div className="hidden lg:flex lg:flex-grow items-center justify-between space-x-1">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <img src={logo} alt="logo" className="w-40" />
              </motion.div>

              <div className="flex items-center">
                {navItems.map((item) => (
                  !item.isDropdown ? (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `px-4 py-2 text-base font-medium rounded-md transition-colors duration-200 ${
                          isActive ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ) : (
                    /* INTERNSHIP DROPDOWN */
                    <div 
                      key={item.label}
                      className="relative px-4 py-2"
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                    >
                      <button className={`flex items-center gap-1 text-base font-medium transition-colors duration-200 ${isHovered ? 'text-blue-600' : 'text-gray-700'}`}>
                        {item.label}
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isHovered ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute left-0 mt-2 w-52 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden py-2"
                          >
                            {item.subItems.map((sub) => (
                              <Link
                                key={sub.to}
                                to={sub.to}
                                className="block px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                              >
                                {sub.label}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                ))}
              </div>

              {/* Auth Buttons */}
              <div className="flex items-center space-x-4">
                {isAuthenticated ? (
                  <Link to="/profile">
                    <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="profile" className="w-10 h-10" />
                  </Link>
                ) : (
                  <>
                    <Link to="/signup" className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-all">Sign Up</Link>
                    <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-300 transition-all">Log In</Link>
                  </>
                )}
              </div>
            </div>

            {/* Mobile View Toggle */}
            <div className="flex justify-between items-center lg:hidden">
              <img src={logo} alt="logo" className="w-40" />
              <button onClick={toggleMenu} className="text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>

            {/* Mobile Menu Content */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="lg:hidden mt-4 overflow-hidden"
                >
                  <div className="flex flex-col space-y-2 p-2">
                    {navItems.map((item) => (
                      !item.isDropdown ? (
                        <NavLink key={item.to} to={item.to} className="px-4 py-2 text-sm font-medium rounded-lg">
                          {item.label}
                        </NavLink>
                      ) : (
                        <div key={item.label} className="flex flex-col">
                          <span className="px-4 py-2 text-sm font-bold text-gray-400 uppercase tracking-wider">{item.label}</span>
                          {item.subItems.map((sub) => (
                            <NavLink key={sub.to} to={sub.to} className="px-8 py-2 text-sm font-medium rounded-lg">
                              • {sub.label}
                            </NavLink>
                          ))}
                        </div>
                      )
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>
      </header>
      
      <main className="flex-grow w-full pt-24">
        <Outlet />
      </main>
    </>
  );
};

export default Layout;