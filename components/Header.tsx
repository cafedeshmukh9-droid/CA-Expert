
import React from 'react';
import { AppView } from '../types';

interface HeaderProps {
  activeView: AppView;
}

const Header: React.FC<HeaderProps> = ({ activeView }) => {
  const getTitle = () => {
    switch(activeView) {
      case AppView.DASHBOARD: return 'Welcome to FinExpert AI';
      case AppView.CHAT: return 'Financial Expert Advisor';
      case AppView.ANALYSIS: return 'Smart Audit & Analysis';
      case AppView.MEDIA_GEN: return 'AI Visual & Video Generation';
      case AppView.VOICE_LIVE: return 'Real-time Voice Consultant';
      default: return 'FinExpert AI';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <h1 className="text-xl font-bold text-slate-800">{getTitle()}</h1>
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-100 uppercase">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
          AI Expert Online
        </div>
        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
