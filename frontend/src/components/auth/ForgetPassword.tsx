import axios from 'axios';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function ForgetPassword() {
  const navigate = useNavigate();
  const [data,setData] = useState({
    email : ""
  });
 const handlechange = (e) =>{
  const{name,value} = e.target;
  setData({
    ...data,[name]:value
  })
 }
 console.log(data);
const resetPassword = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post("http://localhost:5000/api/auth/forget-password", {
      email: data.email
    });
    alert('Reset Password Email Sent!!');
    navigate("/login"); // navigate to login page
    console.log("Password reset link sent:", response.data);
  } catch (error) {
    console.error("Error resetting password:", error);
  }
};
  return (
    <div>
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="bg-white shadow-lg rounded-2xl p-8 w-96 flex flex-col gap-5">

          {/* Heading */}
          <h1 className="text-2xl font-bold text-gray-800">
            Forgot your password?
          </h1>

          {/* Description */}
          <p className="text-sm text-gray-500">
            Enter your email address and we’ll send you a link to reset your password.
          </p>

          {/* Form */}
          <form className="flex flex-col gap-4" onSubmit={resetPassword}>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={data.email}
              onChange={handlechange}
            />

            <button
              type="submit"
              className="bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
            >
              Send Reset Link
            </button>
          </form>
          {/* Back to login */}
          <p className="text-sm text-gray-500" onClick={() => navigate('/login')}>
            Remember your password ?<p className='hover:underline mt-2 cursor-pointer text-blue-500 font-semibold'>← Back to Login</p>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgetPassword