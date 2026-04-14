import React, { useState, useEffect } from 'react';
import Sidebar from '../pages/Sidebar'; 

const StudentTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyTickets = async () => {
      try {
        // We use the @GetMapping endpoint with studentId=1
        const response = await fetch('http://localhost:8080/api/tickets?studentId=1');
        if (!response.ok) throw new Error('Failed to fetch tickets');
        
        const data = await response.json();
        setTickets(data);
      } catch (err) {
        console.error("Backend Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyTickets();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar role="student" userName="User Niner" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b-2 border-gray-100 p-6">
          <h1 className="text-2xl font-black text-[#005035] tracking-tight">My Work Orders</h1>
          <p className="text-sm text-gray-500 font-medium">Track and manage your submitted maintenance requests.</p>
        </header>

        <main className="p-8 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#005035] mb-4"></div>
              <p className="font-bold">Syncing with University Database...</p>
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ticket ID</th>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Issue</th>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Priority</th>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {tickets.length > 0 ? tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-green-50/30 transition-colors group">
                      <td className="p-6">
                        <span className="font-mono text-[#A49665] font-black">#{t.id}</span>
                      </td>
                      <td className="p-6">
                        <div className="font-bold text-gray-800">{t.title}</div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">{t.description}</div>
                      </td>
                      <td className="p-6">
                        <span className={`text-[10px] font-black px-2 py-1 rounded border ${
                          t.priority === 'HIGH' ? 'border-red-200 text-red-600 bg-red-50' : 'border-gray-200 text-gray-600'
                        }`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="p-6">
                        <span className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${t.status === 'OPEN' ? 'bg-blue-500' : 'bg-[#005035]'}`}></span>
                          <span className="text-xs font-black text-gray-700 uppercase tracking-tighter">{t.status}</span>
                        </span>
                      </td>
                      <td className="p-6 text-right text-gray-400 text-sm font-medium">
                        {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="p-20 text-center text-gray-400 font-medium">
                        No tickets found. Submit one from the dashboard!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentTickets;