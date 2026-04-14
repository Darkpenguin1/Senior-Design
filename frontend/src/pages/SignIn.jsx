import React from 'react';
import { useNavigate } from 'react-router-dom';

const SignIn = () => {
  const navigate = useNavigate();

  const handleLogin = (role) => {
    navigate(`/signin/${role}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-6">
      {/* UNCC Branding Header */}
      <div className="mb-8 text-center">
        <div className="bg-[#005035] p-4 rounded-full inline-block mb-4 shadow-lg">
           {/* Simple placeholder for a logo */}
           <div className="w-12 h-12 border-4 border-[#A49665] rounded-full flex items-center justify-center text-white font-black text-xl">CLT</div>
        </div>
        <h1 className="text-3xl font-extrabold text-[#005035] tracking-tight">PickFix Portals</h1>
        <p className="text-gray-500 font-medium">University of North Carolina at Charlotte</p>
      </div>

      {/* Login Card */}
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-md border-t-8 border-[#A49665]">
        <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">Welcome Back</h2>
        <p className="text-sm text-gray-400 text-center mb-8">Please select your portal to continue</p>

        <div className="space-y-4">
          {/* Student Button */}
          <button 
            onClick={() => handleLogin('student')}
            className="w-full group flex items-center justify-between p-4 bg-gray-50 border-2 border-transparent hover:border-[#005035] hover:bg-green-50 rounded-2xl transition-all duration-200"
          >
            <div className="text-left">
              <span className="block font-bold text-gray-800 group-hover:text-[#005035]">Student Portal</span>
              <span className="text-xs text-gray-500">Report issues & track tickets</span>
            </div>
            <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
          </button>

          {/* Contractor Button */}
          <button 
            onClick={() => handleLogin('contractor')}
            className="w-full group flex items-center justify-between p-4 bg-gray-50 border-2 border-transparent hover:border-[#A49665] hover:bg-amber-50 rounded-2xl transition-all duration-200"
          >
            <div className="text-left">
              <span className="block font-bold text-gray-800 group-hover:text-[#A49665]">Contractor Portal</span>
              <span className="text-xs text-gray-500">View assignments & update status</span>
            </div>
            <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
          </button>

          {/* Management Button */}
          <button 
            onClick={() => handleLogin('management')}
            className="w-full group flex items-center justify-between p-4 bg-gray-50 border-2 border-transparent hover:border-gray-800 hover:bg-gray-100 rounded-2xl transition-all duration-200"
          >
            <div className="text-left">
              <span className="block font-bold text-gray-800 group-hover:text-black">Management Portal</span>
              <span className="text-xs text-gray-500">System admin & analytics</span>
            </div>
            <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="mt-10 pt-6 border-t border-gray-100 text-center">
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Senior Design Project 2026</p>
        </div>
      </div>

      {/* Decorative background elements */}
      <div className="fixed bottom-0 left-0 w-64 h-64 bg-[#005035] opacity-[0.03] rounded-full -translate-x-1/2 translate-y-1/2 -z-10"></div>
      <div className="fixed top-0 right-0 w-96 h-96 bg-[#A49665] opacity-[0.03] rounded-full translate-x-1/2 -translate-y-1/2 -z-10"></div>
    </div>
  );
};

export default SignIn;