import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar'; 

const StudentDashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [tickets, setTickets] = useState([]);
  
  // 1. DYNAMIC USER DATA
  const email = localStorage.getItem("email") || "User@uncc.edu";
  const userId = localStorage.getItem("userId") || "1";
  const username = email.split("@")[0];
  const userInitials = username.substring(0, 2).toUpperCase();

  // 2. FETCH REAL TICKETS FOR STATS
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/tickets?studentId=${userId}`);
        const data = await response.json();
        setTickets(data);
      } catch (error) {
        console.error("Error loading tickets:", error);
      }
    };
    fetchTickets();
  }, [userId]);

  // Calculate dynamic stats
  const openCount = tickets.filter(t => t.status === 'OPEN').length;
  const activeCount = tickets.filter(t => t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS').length;
  const doneCount = tickets.filter(t => t.status === 'DONE').length;

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    const ticketData = {
      title: e.target.title.value,
      description: e.target.description.value,
      priority: "MEDIUM",
      status: "OPEN"
    };

    try {
      const response = await fetch(`http://localhost:8080/api/tickets?studentId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData),
      });

      if (response.ok) {
        alert("Success! Ticket stored in MySQL database.");
        setShowModal(false);
        // Refresh local list to update stats
        const newTicket = await response.json();
        setTickets([...tickets, newTicket]);
      }
    } catch (error) {
      console.error("Network Error:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar role="student" userName={username} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b-2 border-gray-100 p-4 flex justify-between items-center shadow-sm">
          <h1 className="text-lg font-bold text-[#005035]">UNC Charlotte Maintenance</h1>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-800 leading-none">{username}</p>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-tighter">{email}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#005035] flex items-center justify-center text-white font-black text-sm ring-2 ring-gray-100 ring-offset-2 uppercase">
              {userInitials}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto space-y-10">
            
            {/* Header & Dynamic Stats Row */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-4xl font-black text-gray-900 tracking-tight">Welcome, {username}</h2>
                <p className="text-gray-500 mt-1 font-medium">Niner Housing & Maintenance Portal</p>
              </div>
              
              <div className="flex gap-4">
                {[
                  { label: 'OPEN', count: openCount, color: 'border-blue-500' },
                  { label: 'ACTIVE', count: activeCount, color: 'border-[#A49665]' },
                  { label: 'DONE', count: doneCount, color: 'border-[#005035]' }
                ].map((stat) => (
                  <div key={stat.label} className={`bg-white border-b-4 ${stat.color} shadow-md p-4 w-24 text-center rounded-2xl`}>
                    <div className="text-2xl font-black text-gray-800">{stat.count}</div>
                    <div className="text-[10px] font-black text-gray-400 tracking-widest uppercase">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dynamic Announcements List */}
            <section className="space-y-4">
               <h3 className="text-xl font-bold text-gray-800 px-1">Announcements</h3>
               <div className="bg-white border-l-4 border-[#A49665] p-5 shadow-sm rounded-r-2xl border-y border-r border-gray-100">
                 <h4 className="font-bold text-[#005035]">System Update</h4>
                 <p className="text-sm text-gray-600">
                    You have <span className="font-bold">{openCount} pending tickets</span>. 
                    Check the "My Tickets" tab for detailed status updates from contractors.
                 </p>
               </div>
            </section>

            {/* Submission Section */}
            <section className="bg-[#005035] rounded-[2.5rem] p-12 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#A49665] opacity-20 blur-3xl rounded-full"></div>
              <h3 className="text-2xl font-black text-white mb-2 uppercase">Have an issue?</h3>
              <p className="text-green-100 mb-8 opacity-80 font-medium">Submit a work order and track it in real-time.</p>
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

      {/* Submission Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] max-w-lg w-full p-10 shadow-2xl animate-in zoom-in duration-150">
            <h2 className="text-2xl font-black text-[#005035] mb-2 tracking-tight">New Maintenance Request</h2>
            <p className="text-gray-400 text-sm mb-6">Posting as {email}</p>
            
            <form onSubmit={handleTicketSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Subject / Title</label>
                <input 
                  name="title" 
                  required 
                  placeholder="e.g. Leaking Faucet"
                  className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-[#A49665] outline-none font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Detailed Description</label>
                <textarea 
                  name="description"
                  required
                  className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-[#A49665] outline-none transition-all font-medium" 
                  rows="3" 
                  placeholder="Tell us exactly what is wrong..."
                ></textarea>
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowModal(false)} type="button" className="flex-1 py-4 text-gray-400 font-bold hover:bg-gray-50 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-[#005035] text-white font-black rounded-xl shadow-lg hover:bg-[#00402a] transition-all">Send Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;