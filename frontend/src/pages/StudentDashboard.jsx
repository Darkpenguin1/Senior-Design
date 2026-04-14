import React, { useState } from 'react';
import Sidebar from '../pages/Sidebar'; // Verified path based on your screenshots

const StudentDashboard = () => {
  const [showModal, setShowModal] = useState(false);

  // Function to handle the form submission to your backend
  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    
    // Example data structure - adjust based on your Java Ticket Model
    const ticketData = {
      description: e.target.description.value,
      status: "OPEN",
      userId: "user-niner-123", // Placeholder for actual auth
      createdAt: new Date().toISOString()
    };

    try {
      // Pointing to your Java ticketing-service
      const response = await fetch('http://localhost:8080/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData),
      });

      if (response.ok) {
        alert("Ticket submitted successfully!");
        setShowModal(false);
      }
    } catch (error) {
      console.error("Error submitting ticket:", error);
      alert("Failed to connect to ticketing service.");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* 1. SIDEBAR - Fixed role and path */}
      <Sidebar role="student" userName="User Niner" />

      {/* 2. MAIN CONTENT AREA - Removed the extra </div> that was here */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="bg-white border-b-2 border-gray-100 p-4 flex justify-between items-center shadow-sm">
          <h1 className="text-lg font-bold text-[#005035]">University of North Carolina at Charlotte</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">User Niner</span>
            <div className="w-10 h-10 rounded-full bg-[#005035] flex items-center justify-center text-white font-bold">UN</div>
          </div>
        </header>

        {/* Dashboard Scrollable Body */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto space-y-10">
            
            {/* Header & Stats Row */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-4xl font-black text-gray-900 tracking-tight">Good morning, User</h2>
                <p className="text-gray-500 mt-1 font-medium">Here is your current ticket status overview.</p>
              </div>
              
              <div className="flex gap-4">
                {[
                  { label: 'OPEN', count: 2, color: 'border-blue-500' },
                  { label: 'ACTIVE', count: 1, color: 'border-[#A49665]' },
                  { label: 'DONE', count: 5, color: 'border-[#005035]' }
                ].map((stat) => (
                  <div key={stat.label} className={`bg-white border-b-4 ${stat.color} shadow-md p-4 w-24 text-center rounded-2xl transition-transform hover:-translate-y-1`}>
                    <div className="text-2xl font-black text-gray-800">{stat.count}</div>
                    <div className="text-[10px] font-black text-gray-400 tracking-widest uppercase">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Announcements List */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Announcements</h3>
                <button className="text-sm font-bold text-[#005035] hover:underline">See all</button>
              </div>
              
              <div className="space-y-3">
                <div className="bg-white border-l-4 border-[#A49665] p-5 shadow-sm rounded-r-2xl flex justify-between items-start transition-all hover:shadow-md">
                  <div>
                    <span className="text-[10px] font-black text-[#A49665] uppercase tracking-widest">Notice</span>
                    <h4 className="font-bold text-[#005035] text-lg">Water shut-off — Building C</h4>
                    <p className="text-sm text-gray-600 mt-1">Scheduled 6:00–10:00 AM. Plan ahead for shower access.</p>
                  </div>
                  <span className="text-xs text-gray-400 font-bold bg-gray-50 px-2 py-1 rounded">Nov 14</span>
                </div>

                <div className="bg-white border-l-4 border-[#005035] p-5 shadow-sm rounded-r-2xl flex justify-between items-start transition-all hover:shadow-md">
                  <div>
                    <span className="text-[10px] font-black text-[#005035] uppercase tracking-widest">Resolved</span>
                    <h4 className="font-bold text-[#005035] text-lg">Elevators restored — Main Hall</h4>
                    <p className="text-sm text-gray-600 mt-1">All elevators are back in service. Thanks for your patience.</p>
                  </div>
                  <span className="text-xs text-gray-400 font-bold bg-gray-50 px-2 py-1 rounded">Nov 12</span>
                </div>
              </div>
            </section>

            {/* LARGE RED BUTTON SECTION */}
            <section className="bg-[#005035] rounded-[2.5rem] p-12 text-center shadow-2xl relative overflow-hidden">
              {/* Decorative Gold Glow */}
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#A49665] opacity-20 blur-3xl rounded-full"></div>
              
              <h3 className="text-3xl font-black text-white mb-3 tracking-tight uppercase">Submit Issues</h3>
              <p className="text-green-100 mb-10 max-w-md mx-auto font-medium opacity-90">Click below to submit a ticket with photos. Our maintenance team will be notified immediately.</p>
              
              <button 
                onClick={() => setShowModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-black py-6 px-16 rounded-2xl shadow-[0_10px_30px_rgba(220,38,38,0.4)] transform transition-all hover:scale-105 active:scale-95 text-xl tracking-wider"
              >
                SUBMIT NEW TICKET
              </button>
            </section>
          </div>
        </main>
      </div>

      {/* 3. SUBMISSION MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] max-w-lg w-full p-10 shadow-2xl">
            <h2 className="text-3xl font-black text-[#005035] mb-2 tracking-tight">New Support Ticket</h2>
            <p className="text-gray-500 mb-8 font-medium">Please provide details and any helpful photos.</p>
            
            <form onSubmit={handleTicketSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Issue Description</label>
                <textarea 
                  name="description"
                  required
                  className="w-full border-2 border-gray-100 rounded-2xl p-4 focus:border-[#A49665] focus:ring-4 focus:ring-[#A49665]/10 outline-none transition-all resize-none" 
                  rows="4" 
                  placeholder="Example: The AC in room 204 is making a loud rattling noise..."
                ></textarea>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Upload Photos</label>
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-[#005035] transition-colors cursor-pointer group">
                  <input type="file" className="hidden" id="fileUpload" />
                  <label htmlFor="fileUpload" className="cursor-pointer">
                    <span className="text-sm font-bold text-gray-500 group-hover:text-[#005035]">Click to select files or drag and drop</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowModal(false)} type="button" className="flex-1 py-4 text-gray-400 font-bold hover:text-gray-600 transition">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-[#005035] text-white font-black rounded-2xl shadow-xl hover:bg-[#00402a] transition-all transform hover:-translate-y-1">Submit Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;