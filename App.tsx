
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppView, Message } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ChatSection from './components/ChatSection';
import MediaSection from './components/MediaSection';
import VoiceSection from './components/VoiceSection';
import AnalysisSection from './components/AnalysisSection';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [apiKeySelected, setApiKeySelected] = useState<boolean>(false);

  useEffect(() => {
    const checkApiKey = async () => {
      // Assuming window.aistudio is available in the environment
      if (typeof (window as any).aistudio?.hasSelectedApiKey === 'function') {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setApiKeySelected(hasKey);
      } else {
        // Fallback for dev environment
        setApiKeySelected(true);
      }
    };
    checkApiKey();
  }, []);

  const handleOpenKeyDialog = async () => {
    if (typeof (window as any).aistudio?.openSelectKey === 'function') {
      await (window as any).aistudio.openSelectKey();
      setApiKeySelected(true);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.CHAT:
        return <ChatSection />;
      case AppView.MEDIA_GEN:
        return <MediaSection onNeedKey={handleOpenKeyDialog} />;
      case AppView.VOICE_LIVE:
        return <VoiceSection />;
      case AppView.ANALYSIS:
        return <AnalysisSection />;
      case AppView.DASHBOARD:
      default:
        return <Dashboard onViewChange={setCurrentView} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar activeView={currentView} onNavigate={setCurrentView} />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header activeView={currentView} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {!apiKeySelected && (currentView === AppView.MEDIA_GEN) ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white rounded-2xl shadow-sm">
              <div className="bg-blue-100 p-4 rounded-full mb-4">
                <svg className="w-12 h-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">API Key Required for Advanced Media</h2>
              <p className="text-slate-600 mb-6 max-w-md">
                To generate high-quality images and videos, you need to select a billing-enabled API key.
                <br />
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-blue-600 underline">Learn more about billing</a>
              </p>
              <button 
                onClick={handleOpenKeyDialog}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition shadow-lg shadow-blue-200"
              >
                Select API Key
              </button>
            </div>
          ) : renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
