import React from 'react';
import Sidebar from './Sidebar';

const ManagementDashboard = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* 1. Main Green Sidebar */}
      <Sidebar role="management" userName="Admin User" />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <header className="bg-[#005035] text-white p-6 shadow-md">
          <h1 className="text-2xl font-bold">Campus Operations Dashboard</h1>
        </header>

        {/* Scrollable Main Section */}
        <main className="p-8 space-y-8 overflow-y-auto">
          
          {/* Top Level Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Avg. Resolution Time', val: '4.2 hrs', color: 'text-[#005035]' },
              { label: 'Unassigned Tickets', val: '12', color: 'text-red-600' },
              { label: 'Student Satisfaction', val: '94%', color: 'text-[#A49665]' },
              { label: 'Budget Used', val: '62%', color: 'text-gray-700' },
            ].map((m, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-[#A49665]">
                <p className="text-xs font-bold text-gray-400 uppercase">{m.label}</p>
                <p className={`text-3xl font-black mt-2 ${m.color}`}>{m.val}</p>
              </div>
            ))}
          </div>

          {/* Activity Table Placeholder */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Recent Campus Activity</h3>
              <button className="text-xs bg-gray-100 px-3 py-1 rounded-md font-bold text-gray-600">
                Export CSV
              </button>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-4">Ticket ID</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Assigned To</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="p-4 font-mono text-[#005035]">#FIX-9021</td>
                  <td className="p-4">Cone Center</td>
                  <td className="p-4">
                    <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-[10px] font-bold">
                      PENDING
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">Crew #402</td>
                </tr>
              </tbody>
            </table>
          </div>
        </main>
      </div> {/* End Main Content Area */}
    </div> /* End Main Flex Container */
  );
};

export default ManagementDashboard;