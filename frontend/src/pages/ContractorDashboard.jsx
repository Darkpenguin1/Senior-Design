import React from 'react';
import Sidebar from './Sidebar';

const ContractorDashboard = () => {
  const username = (localStorage.getItem("email") || "").split("@")[0] || "User";
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Consistent UNCC Green */}
      <Sidebar role="contractor" userName={username} />
      <div className="w-64 bg-[#005035] text-white hidden md:flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-[#A49665]">Field Portal</div>
        <nav className="flex-1 mt-4">
          <a href="#" className="block py-3 px-6 bg-[#A49665]/20 border-l-4 border-[#A49665]">Active Jobs</a>
          <a href="#" className="block py-3 px-6 hover:bg-[#A49665] transition">Inventory</a>
        </nav>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-[#005035]">Maintenance Crew #402</h1>
          <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full italic">ON DUTY</span>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Active Job Card */}
          <div className="bg-white border-2 border-[#A49665] rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-black text-[#A49665] uppercase">Current Assignment</span>
                <h2 className="text-2xl font-bold text-gray-800">HVAC Leak - Fretwell 210</h2>
              </div>
              <button className="bg-[#005035] text-white px-4 py-2 rounded-lg font-bold text-sm">Update Status</button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4">
              <div><p className="text-gray-400">Reported By</p><p className="font-semibold">Alex Niner</p></div>
              <div><p className="text-gray-400">Priority</p><p className="font-semibold text-red-600">High</p></div>
            </div>
          </div>

          {/* Job Queue */}
          <section>
            <h3 className="font-bold text-gray-700 mb-3 text-lg">Upcoming Tasks</h3>
            <div className="space-y-3">
              {['Broken Window - Scott Hall', 'Light Out - Student Union'].map((job, i) => (
                <div key={i} className="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center">
                  <p className="font-bold text-gray-700">{job}</p>
                  <button className="text-[#005035] font-bold text-sm hover:underline">View Details</button>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};
export default ContractorDashboard;