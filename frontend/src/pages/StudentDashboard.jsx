import React, { useState } from 'react';
import Sidebar from './Sidebar'; 

const StudentDashboard = () => {
  const [showModal, setShowModal] = useState(false);
  
  const email = localStorage.getItem("email") || "User@uncc.edu";
  const userId = localStorage.getItem("userId") || "1";
  const username = email.split("@")[0];

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
        alert("Ticket Created!");
        setShowModal(false);
      }
    } catch (error) {
      console.error("Submission failed:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar role="student" userName={username} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b-2 p-4 flex justify-between items-center shadow-sm">
          <h1 className="text-lg font-bold text-[#005035]">UNCC Maintenance</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">{email}</span>
            <div className="w-10 h-10 rounded-full bg-[#005035] flex items-center justify-center text-white font-bold uppercase">
              {username.substring(0,2)}
            </div>
          </div>
        </header>

        <main className="flex-1 p-8">
          <div className="bg-[#005035] rounded-[2.5rem] p-12 text-center shadow-2xl">
            <h3 className="text-2xl font-black text-white mb-4 uppercase">Submit Work Order</h3>
            <button onClick={() => setShowModal(true)} className="bg-red-600 hover:bg-red-700 text-white font-black py-4 px-10 rounded-2xl shadow-xl transition-all hover:scale-105">
              NEW REQUEST +
            </button>
          </div>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form onSubmit={handleTicketSubmit} className="bg-white rounded-[2rem] max-w-lg w-full p-10 shadow-2xl space-y-5">
            <h2 className="text-2xl font-black text-[#005035]">Request Details</h2>
            <input name="title" required placeholder="Issue Title" className="w-full border-2 rounded-xl p-3 outline-none" />
            <textarea name="description" required rows="3" placeholder="Describe the problem..." className="w-full border-2 rounded-xl p-3 outline-none" />
            <div className="flex gap-4">
              <button onClick={() => setShowModal(false)} type="button" className="flex-1 py-4 font-bold text-gray-400">Cancel</button>
              <button type="submit" className="flex-1 py-4 bg-[#005035] text-white font-black rounded-xl">Submit</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;