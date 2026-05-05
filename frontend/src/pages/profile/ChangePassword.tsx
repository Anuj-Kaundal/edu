import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";

function ChangePassword() {
  // State definitions
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Input change handler
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(""); // Typing ke waqt error hata do
  };

  // Toggle visibility handler
  const toggleVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Basic frontend checks
    if (form.newPassword !== form.confirmPassword) {
      return setError("New password aur Confirm password does't match!");
    }
    if (form.newPassword.length < 6) {
      return setError("password length min 6");
    }

    setLoading(true);

    try {
      // API call - withCredentials true zaroori hai cookies bhejane ke liye
      const { data } = await axios.post(
        "http://localhost:5000/api/change-password", // Change to your actual URL
        {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        },
        { withCredentials: true } 
      );

      setSuccess(data.message);
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); // Form clear
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 font-sans">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-[350px]"
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Change Password
        </h2>

        {error && <div className="mb-4 text-red-500 text-sm text-center bg-red-50 py-2 rounded-md">{error}</div>}
        {success && <div className="mb-4 text-green-600 text-sm text-center bg-green-50 py-2 rounded-md">{success}</div>}

        {/* Current Password */}
        <div className="mb-4 relative">
          <label className="block mb-1 text-sm font-medium text-gray-700">Current Password</label>
          <input
            type={showPassword.current ? "text" : "password"}
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter current password"
            required
          />
          <span
            onClick={() => toggleVisibility("current")}
            className="absolute right-3 top-9 cursor-pointer text-gray-500 hover:text-gray-700"
          >
            {showPassword.current ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        {/* New Password */}
        <div className="mb-4 relative">
          <label className="block mb-1 text-sm font-medium text-gray-700">New Password</label>
          <input
            type={showPassword.new ? "text" : "password"}
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter new password"
            required
          />
          <span
            onClick={() => toggleVisibility("new")}
            className="absolute right-3 top-9 cursor-pointer text-gray-500 hover:text-gray-700"
          >
            {showPassword.new ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        {/* Confirm Password */}
        <div className="mb-6 relative">
          <label className="block mb-1 text-sm font-medium text-gray-700">Confirm Password</label>
          <input
            type={showPassword.confirm ? "text" : "password"}
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Confirm new password"
            required
          />
          <span
            onClick={() => toggleVisibility("confirm")}
            className="absolute right-3 top-9 cursor-pointer text-gray-500 hover:text-gray-700"
          >
            {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2.5 rounded-lg text-white font-semibold transition shadow-md ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
          }`}
        >
          {loading ? "Changing..." : "Change Password"}
        </button>
      </form>
    </div>
  );
}

export default ChangePassword;