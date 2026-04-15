import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ role, userName }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Helper to determine if a link is active
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // Define menu items based on the user's role
  const menuItems = {
    student: [
      { name: 'Dashboard', path: '/student', icon: '' },
    ],
    contractor: [
      { name: 'Active Jobs', path: '/contractor', icon: '' },
    ],
    management: [
      { name: 'Overview', path: '/management', icon: '' },
    ]
  };

  const currentMenu = menuItems[role] || [];

  return (
    <div className="w-64 bg-[#005035] text-white flex flex-col h-full shadow-xl">
      {/* Branding */}
      <div className="p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 border-2 border-[#A49665] rounded-full flex items-center justify-center font-bold text-xs text-[#A49665]">
            CLT
          </div>
          <h2 className="text-xl font-black tracking-tighter">PickFix</h2>
        </div>
        <p className="text-[10px] text-[#A49665] font-bold uppercase tracking-widest leading-tight">
          University of North Carolina <br/> at Charlotte
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 mt-4 px-4 space-y-2">
        {currentMenu.map((item) => (
          <button
            key={item.name}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all duration-200 ${
              isActive(item.path)
                ? 'bg-[#A49665] text-white shadow-lg'
                : 'text-green-100 hover:bg-white/10 hover:translate-x-1'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.name}
          </button>
        ))}
      </nav>

      {/* Bottom User Section */}
      <div className="p-6 border-t border-green-800/50">
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-10 h-10 rounded-full bg-[#A49665] flex items-center justify-center font-bold">
            {userName ? userName.charAt(0) : 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold truncate">{userName || 'Niner User'}</p>
            <p className="text-[10px] text-green-300 uppercase font-black tracking-tighter capitalize">{role}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-3 px-4 border border-[#A49665]/50 text-[#A49665] rounded-xl font-bold text-sm hover:bg-[#A49665] hover:text-white transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;