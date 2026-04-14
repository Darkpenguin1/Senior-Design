import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';

const StudentTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState(null); // For viewing details

  // Fetching data from your backend
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/tickets');
        const data = await response.json();
        setTickets(data);
      } catch (err) {
        console.error("Failed to load tickets", err);
        // Fallback mock data for demo if backend is down
        setTickets([
          { id: 'T-1001', title: 'Broken Window', location: 'Scott Hall', status: 'In Progress', date: '2026-04-01', description: 'Glass is cracked in room 302.' },
          { id: 'T-1002', title: 'Leaky Faucet', location: 'Union 2nd Floor', status: 'Completed', date: '2026-03-28', description: 'Bathroom sink wont stop dripping.' },
          { id: 'T-1003', title: 'HVAC Noise', location: 'Cato Hall', status: 'Open', date: '2026-04-03', description: 'Loud rattling coming from the vents.' },
        ]);
      }
    };
    fetchTickets();
  }, []);

  const filteredTickets = filter === 'All' 
    ? tickets 
    : tickets.filter(t => t.status === filter);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="student" userName="User Niner" />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Section */}
        <header className="bg-white border-b-2 border-gray-100 p-8">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-[#005035] tracking-tight">Ticket History</h1>
              <p className="text-gray-500 font-medium">View and track your active maintenance requests.</p>
            </div>
            
            {/* Filter Pills */}
            <div className="flex bg-gray-100 p-1 rounded-xl">
              {['All', 'Open', 'In Progress', 'Completed'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    filter === tab ? 'bg-white text-[#005035] shadow-sm' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Reference</th>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Issue Details</th>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Current Status</th>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="group hover:bg-green-50/30 transition-all">
                      <td className="p-6">
                        <span className="font-mono text-sm font-bold text-[#A49665]">{ticket.id}</span>
                        <p className="text-[10px] text-gray-400 mt-1">{new Date(ticket.date).toLocaleDateString()}</p>
                      </td>
                      <td className="p-6">
                        <p className="font-bold text-gray-800 text-lg">{ticket.title}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <span className="opacity-50 text-xs">📍</span> {ticket.location}
                        </p>
                      </td>
                      <td className="p-6">
                        <div className="flex flex-col items-center">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                            ticket.status === 'Completed' ? 'bg-green-100 text-[#005035]' : 
                            ticket.status === 'In Progress' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {ticket.status}
                          </span>
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <button 
                          onClick={() => setSelectedTicket(ticket)}
                          className="bg-white border-2 border-gray-100 text-gray-600 hover:border-[#A49665] hover:text-[#A49665] px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredTickets.length === 0 && (
                <div className="p-20 text-center">
                  <p className="text-gray-400 font-bold italic">No tickets found matching this filter.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Ticket Detail Sidebar/Slide-over */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 p-8 flex flex-col">
            <button 
              onClick={() => setSelectedTicket(null)}
              className="self-end text-gray-400 hover:text-black text-2xl"
            >✕</button>
            
            <div className="mt-6">
              <span className="text-[#A49665] font-mono font-bold">{selectedTicket.id}</span>
              <h2 className="text-3xl font-black text-[#005035] mt-2">{selectedTicket.title}</h2>
              <div className="mt-6 space-y-4 text-sm">
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">Description</p>
                  <p className="text-gray-700 font-medium leading-relaxed">{selectedTicket.description}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">Timeline</p>
                  <div className="border-l-2 border-gray-100 ml-2 pl-4 py-2 space-y-4">
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-green-500"></div>
                      <p className="font-bold text-xs">Ticket Created</p>
                      <p className="text-[10px] text-gray-400">{selectedTicket.date}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button 
              className="mt-auto w-full py-4 bg-[#005035] text-white font-bold rounded-2xl shadow-lg hover:shadow-green-900/30 transition-all"
            >
              Message Support
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTickets;