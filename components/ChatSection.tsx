
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { generateExpertResponse } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const ChatSection: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: "নমস্কার! আমি আপনার Senior CA Advisor. Accounting, GST, বা Financial Analysis নিয়ে কোনো প্রশ্ন থাকলে নির্দ্বিধায় জিজ্ঞাসা করুন। আমি আপনাকে Bengali ভাষায় সব বুঝিয়ে দেব।",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<{ thinking: boolean, search: boolean, maps: boolean }>({
    thinking: false,
    search: false,
    maps: false
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  // Auto-resize textarea logic
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '52px'; // Reset to min-height first to shrink if needed
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, 52), 150)}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Reset height after sending
    if (textareaRef.current) {
      textareaRef.current.style.height = '52px';
    }

    try {
      let location = undefined;
      if (mode.maps) {
        // Try to get user location for maps grounding
        const pos = await new Promise<GeolocationPosition>((res, rej) => {
          navigator.geolocation.getCurrentPosition(res, rej);
        }).catch(() => null);
        
        if (pos) {
          location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        } else {
          location = { lat: 22.5726, lng: 88.3639 }; // Default to Kolkata if denied
        }
      }

      const response = await generateExpertResponse(
        input, 
        mode.thinking, 
        mode.search, 
        mode.maps,
        location
      );

      const modelMessage: Message = {
        role: 'model',
        text: response.text || "দুঃখিত, কোনো উত্তর পাওয়া যায়নি।",
        timestamp: Date.now(),
        groundingMetadata: response.candidates?.[0]?.groundingMetadata
      };

      setMessages(prev => [...prev, modelMessage]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: 'model',
        text: "Error: কিছু একটা সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Mode Selectors */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-3 items-center">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-2">Advisory Mode:</span>
        <button 
          onClick={() => setMode(m => ({ ...m, thinking: !m.thinking }))}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
            mode.thinking ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
          }`}
        >
          <span className="text-sm">🧠</span> Deep Thinking
        </button>
        <button 
          onClick={() => setMode(m => ({ ...m, search: !m.search }))}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
            mode.search ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
          }`}
        >
          <span className="text-sm">🔍</span> Search Grounding
        </button>
        <button 
          onClick={() => setMode(m => ({ ...m, maps: !m.maps }))}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
            mode.maps ? 'bg-green-600 text-white border-green-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-green-300'
          }`}
        >
          <span className="text-sm">📍</span> Maps Context
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-3xl p-5 ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-slate-100 text-slate-800 rounded-tl-none'
            }`}>
              {m.role === 'model' && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase opacity-60">Senior Advisor AI</span>
                </div>
              )}
              <div className="prose prose-slate max-w-none text-sm md:text-base leading-relaxed">
                <ReactMarkdown 
                  components={{
                    table: ({node, ...props}) => <div className="overflow-x-auto my-4"><table className="min-w-full divide-y divide-slate-300 border border-slate-300" {...props} /></div>,
                    thead: ({node, ...props}) => <thead className="bg-slate-200" {...props} />,
                    th: ({node, ...props}) => <th className="px-4 py-2 text-left font-bold border" {...props} />,
                    td: ({node, ...props}) => <td className="px-4 py-2 border" {...props} />,
                  }}
                >
                  {m.text}
                </ReactMarkdown>
              </div>

              {m.groundingMetadata?.groundingChunks && (
                <div className="mt-4 pt-4 border-t border-slate-200/50">
                  <p className="text-[10px] font-bold uppercase text-slate-500 mb-2">Sources & References:</p>
                  <div className="flex flex-wrap gap-2">
                    {m.groundingMetadata.groundingChunks.map((chunk: any, ci: number) => {
                      const link = chunk.web?.uri || chunk.maps?.uri;
                      const title = chunk.web?.title || chunk.maps?.title || "View Source";
                      if (!link) return null;
                      return (
                        <a 
                          key={ci} 
                          href={link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-white/50 hover:bg-white px-2 py-1 rounded text-[10px] text-blue-600 border border-blue-200 truncate max-w-[200px]"
                        >
                          {title}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 p-4 rounded-3xl flex items-center gap-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
              </div>
              <span className="text-xs font-semibold text-slate-500">Analysing and generating response...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <div className="relative flex items-end gap-2 max-w-4xl mx-auto">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask me about GST, Income Tax, Excel Formulas, etc..."
            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm overflow-hidden"
            rows={1}
            style={{ minHeight: '52px', maxHeight: '150px', resize: 'none' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`p-3 rounded-2xl flex-shrink-0 transition-all shadow-lg ${
              input.trim() && !isLoading 
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200' 
                : 'bg-slate-200 text-slate-400 shadow-none'
            }`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-3 font-medium uppercase tracking-tight">
          Senior CA AI Advisor uses Real-time grounding for high accuracy. Check compliance rules carefully.
        </p>
      </div>
    </div>
  );
};

export default ChatSection;
