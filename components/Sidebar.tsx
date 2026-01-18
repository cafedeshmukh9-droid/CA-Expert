
import React from 'react';
import { AppView } from '../types';

interface SidebarProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate }) => {
  const menuItems = [
    { id: AppView.DASHBOARD, icon: '🏠', label: 'Dashboard' },
    { id: AppView.CHAT, icon: '💬', label: 'Expert Chat' },
    { id: AppView.ANALYSIS, icon: '📊', label: 'Audit & Analysis' },
    { id: AppView.MEDIA_GEN, icon: '🎨', label: 'Visual Tools' },
    { id: AppView.VOICE_LIVE, icon: '🎙️', label: 'Live Voice' },
  ];

  return (
    <div className="w-20 md:w-64 bg-slate-900 h-full flex flex-col text-white transition-all duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-xl font-bold">FA</div>
        <span className="hidden md:block text-lg font-bold tracking-tight">FinExpert AI</span>
      </div>
      
      <nav className="flex-1 px-3 space-y-2 mt-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeView === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="hidden md:block font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-800">
        <div className="hidden md:flex items-center gap-3 px-2 py-3 bg-slate-800 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-slate-600 overflow-hidden">
            <img src="https://picsum.photos/32/32" alt="Avatar" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate">Senior CA</p>
            <p className="text-xs text-slate-500 truncate">Expert Advisor</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
