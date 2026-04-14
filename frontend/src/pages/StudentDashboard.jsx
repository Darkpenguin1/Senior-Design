import React, { useState } from 'react';
import Sidebar from '../pages/Sidebar';

const StudentDashboard = () => {
  // This state controls the popup for the ticket submission
  const [showModal, setShowModal] = useState(false);
  const username = (localStorage.getItem("email") || "").split("@")[0] || "User";

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* 1. SIDEBAR (UNCC Green) */}
      <Sidebar role="student" userName="User Niner" />
      <div className="w-64 bg-[#005035] text-white hidden md:flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-[#A49665]">
          PickFix
        </div>
        <nav className="flex-1 mt-4">
          <a href="#" className="block py-3 px-6 bg-[#A49665] bg-opacity-20 border-l-4 border-[#A49665]">Dashboard</a>
          <a href="#" className="block py-3 px-6 hover:bg-[#A49665] transition">My Tickets</a>
          <a href="#" className="block py-3 px-6 hover:bg-[#A49665] transition">Campus Map</a>
        </nav>
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="bg-white border-b-2 border-gray-100 p-4 flex justify-between items-center">
          <h1 className="text-lg font-bold text-[#005035]">University of North Carolina at Charlotte</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">User Niner</span>
            <div className="w-10 h-10 rounded-full bg-[#005035] flex items-center justify-center text-white font-bold">AN</div>
          </div>
        </header>

        {/* Dashboard Scrollable Body */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto space-y-10">
            
            {/* Header & Stats Row */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900">Good morning, {username} </h2>
                <p className="text-gray-500 mt-1">Here is your current ticket status overview.</p>
              </div>
              
              <div className="flex gap-4">
                {[
                  { label: 'OPEN', count: 2, color: 'border-blue-500' },
                  { label: 'ACTIVE', count: 1, color: 'border-[#A49665]' },
                  { label: 'DONE', count: 5, color: 'border-[#005035]' }
                ].map((stat) => (
                  <div key={stat.label} className={`bg-white border-b-4 ${stat.color} shadow-sm p-4 w-24 text-center rounded-xl`}>
                    <div className="text-2xl font-bold text-gray-800">{stat.count}</div>
                    <div className="text-[10px] font-black text-gray-400 tracking-tighter">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Announcements List */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Announcements</h3>
                <button className="text-sm font-semibold text-[#005035] hover:underline">See all</button>
              </div>
              
              <div className="space-y-3">
                <div className="bg-white border-l-4 border-[#A49665] p-4 shadow-sm rounded-r-xl flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-[#A49665] uppercase tracking-widest">Notice</span>
                    <h4 className="font-bold text-[#005035]">Water shut-off — Building C</h4>
                    <p className="text-sm text-gray-600">Scheduled 6:00–10:00 AM. Plan ahead.</p>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">Nov 14</span>
                </div>

                <div className="bg-white border-l-4 border-[#005035] p-4 shadow-sm rounded-r-xl flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-[#005035] uppercase tracking-widest">Resolved</span>
                    <h4 className="font-bold text-[#005035]">Elevators restored — Main Hall</h4>
                    <p className="text-sm text-gray-600">All elevators are back in service.</p>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">Nov 12</span>
                </div>
              </div>
            </section>

            {/* LARGE RED BUTTON SECTION */}
            <section className="bg-[#005035] rounded-3xl p-10 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#A49665] opacity-10 rounded-full"></div>
              <h3 className="text-2xl font-bold text-white mb-3">SUBMIT ISSUES</h3>
              <p className="text-green-100 mb-8 max-w-md mx-auto">Click below to submit a ticket with photos. Our maintenance team will be notified immediately.</p>
              
              <button 
                onClick={() => setShowModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-black py-5 px-14 rounded-2xl shadow-xl transform transition hover:scale-105 active:scale-95 text-xl tracking-wide"
              >
                SUBMIT NEW TICKET
              </button>
            </section>

          </div>
        </main>
      </div>

      {/* 3. SUBMISSION MODAL (The Popup) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-[#005035] mb-2">New Support Ticket</h2>
            <p className="text-gray-500 mb-6 text-sm">Please provide details and any helpful photos.</p>
            
            <form className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Issue Description</label>
                <textarea className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-[#A49665] outline-none transition" rows="3" placeholder="Describe the maintenance issue..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Upload Photos</label>
                <input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-[#005035] hover:file:bg-green-100 cursor-pointer" />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowModal(false)} type="button" className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-[#005035] text-white font-bold rounded-xl shadow-lg hover:bg-[#00402a] transition">Submit Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;