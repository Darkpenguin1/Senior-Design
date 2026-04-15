import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const SignUp = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'student' // Default role
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Call your backend to create the user
      const { data } = await api.post('/auth/signup', formData);

      // 2. Store essential info for the dashboard
      // Note: Use 'data.id' or 'data.studentId' based on your API response
      localStorage.setItem("token", data.token);
      localStorage.setItem("email", data.email);
      localStorage.setItem("studentId", data.id || data.studentId);
      localStorage.setItem("role", data.role);

      alert("Account created successfully!");
      
      // 3. Redirect to the appropriate dashboard
      navigate(`/${data.role}-dashboard`);
    } catch (error) {
      console.error("Signup error:", error);
      alert(error.response?.data?.message || "Failed to create account. Email might already exist.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-6">
      {/* UNCC Branding */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-extrabold text-[#005035] tracking-tight">Create Account</h1>
        <p className="text-gray-500 font-medium">Join the PickFix Maintenance Network</p>
      </div>

      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-md border-t-8 border-[#005035]">
        <form onSubmit={handleSignUp} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase mb-1">First Name</label>
              <input
                name="firstName"
                required
                onChange={handleChange}
                className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-[#A49665] outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase mb-1">Last Name</label>
              <input
                name="lastName"
                required
                onChange={handleChange}
                className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-[#A49665] outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase mb-1">Email (UNCC Preferred)</label>
            <input
              name="email"
              type="email"
              required
              onChange={handleChange}
              placeholder="username@uncc.edu"
              className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-[#A49665] outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase mb-1">Password</label>
            <input
              name="password"
              type="password"
              required
              onChange={handleChange}
              className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-[#A49665] outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase mb-1">I am a...</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-[#A49665] outline-none transition-all bg-white"
            >
              <option value="student">Student</option>
              <option value="contractor">Contractor / Staff</option>
              <option value="management">Management</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-[#005035] text-white font-black rounded-xl shadow-lg hover:bg-[#00402a] transition-all transform hover:-translate-y-1 disabled:opacity-50 mt-4"
          >
            {isSubmitting ? "CREATING ACCOUNT..." : "SIGN UP"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/signin" className="text-[#005035] font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;