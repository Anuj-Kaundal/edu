// src/router/routes.tsx
import { RouteObject } from "react-router-dom";
import Layout from "../components/Layout";
import { Home, Contact, Courses, NotFound, Book } from "../components/Lazy";
import CourseDetails from "../components/CourseDetails";
import Internships from "../pages/Internships";
import PaymentSuccess from "../pages/PaymentSuccess";

import Signup from "../pages/auth/SignUp";
import Login from "../pages/auth/LogIn";
import AboutUs from "../components/AboutUs/AboutUs";
import InternshipDetail from "../components/internships/InternshipDetail";
import PublicRoute from "../components/auth/PublicRoute";
import PrivateRoute from "../components/auth/PrivateRoute";
import Profile from "../pages/profile/Profile";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminLogin from "../pages/admin/AdminLogin";
import AdminProtectedRoute from "../components/auth/AdminProtectedRoute";
import CertificateDetail from "../pages/certificate/CertificateDetail";
import ForgetPassword from "../components/auth/ForgetPassword";
import ResetPassword from "../components/auth/ResetPassword";
import ChangePassword from "../pages/profile/ChangePassword";
import Blog from "../components/Blog";
import News from "../components/News"
import Event from "../components/Event";
import BlogDetails from "../components/BlogDetails";
import NewsDetails from "../components/NewsDetails";
import EventDetails from "../components/EventDetails";
import OfflineInternship from "../components/OfflineInternship";
import New from "../components/New";
import InquiryForm from "../components/InquiryForm";

export const routes: RouteObject[] = [
  // ✅ MAIN LAYOUT (Navbar yaha hoga)
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "session-book", element: <Book /> },
      { path: "contact-us", element: <Contact /> },
      { path: "about-us", element: <AboutUs /> },
      { path: "courses", element: <Courses /> },
      { path: "online-internship", element: <Internships /> },
      { path: "offline-internship", element: <OfflineInternship /> },
      { path: "change-password", element: <ChangePassword /> },
      { path: "blog", element: <Blog /> },
      { path: "news", element: <News /> },
      { path: "event", element: <Event /> },
      { path: "/blogdetails/:id", element: <BlogDetails /> },
      { path: "/newsdetails/:id", element: <NewsDetails /> },
      { path: "/eventdetails/:id", element: <EventDetails /> },
      { path: "blog/:id", element: <BlogDetails /> },
      { path: "news/:id", element: <NewsDetails /> },
      { path: "events/:id", element: <EventDetails /> },
      { path: "/form", element: <InquiryForm/> },
      {
        path: "profile",
        element: (
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        ),
      },

      { path: "courses/:courseId", element: <CourseDetails /> },
      { path: "internships/:internshipId", element: <InternshipDetail /> },
      { path: "payment/success", element: <PaymentSuccess /> },

      { path: "*", element: <NotFound /> },
    ],
  },

  // ❌ AUTH PAGES (NO Navbar)
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/signup",
    element: (
      <PublicRoute>
        <Signup />
      </PublicRoute>
    ),
  },
  {
    path: "/forget-password",
    element: <ForgetPassword />,
  },
  {
    path: "/reset-password/:id/:token",
    element: <ResetPassword />,
  },

  // ✅ ADMIN
  {
    path: "/admin",
    element: <AdminLogin />,
  },
  {
    path: "/admin/dashboard",
    element: (
      <AdminProtectedRoute>
        <AdminDashboard />
      </AdminProtectedRoute>
    ),
  },

  // ✅ OTHER
  {
    path: "/certificate/:id",
    element: <CertificateDetail />,
  },
];