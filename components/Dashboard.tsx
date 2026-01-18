
import React from 'react';
import { AppView } from '../types';

interface DashboardProps {
  onViewChange: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onViewChange }) => {
  const cards = [
    {
      title: "GST & Tax Planning",
      desc: "Get expert advice on Input Tax Credit, GSTR filing, and tax saving strategies in Bengali.",
      icon: "📑",
      view: AppView.CHAT,
      color: "blue"
    },
    {
      title: "Financial Data Analysis",
      desc: "Upload balance sheets or audit logs for instant AI-powered auditing and insights.",
      icon: "📊",
      view: AppView.ANALYSIS,
      color: "green"
    },
    {
      title: "Excel & Python Tools",
      desc: "Generate complex Pivot Table formulas or Python code for finance automation.",
      icon: "💻",
      view: AppView.CHAT,
      color: "indigo"
    },
    {
      title: "Creative Assets",
      desc: "Generate professional financial visualization videos and 4K resolution images.",
      icon: "🎬",
      view: AppView.MEDIA_GEN,
      color: "purple"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <section className="text-center space-y-4">
        <h2 className="text-4xl font-extrabold text-slate-900">Your AI-Powered Senior Financial Partner</h2>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Accounting, Taxation, and Tech Expertise breaking down complex regulations into 
          <span className="font-bold text-blue-600"> Small, Easy Steps</span> in conversational Bengali.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <button 
            key={idx}
            onClick={() => onViewChange(card.view)}
            className="group bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all text-left border border-slate-100 hover:-translate-y-1 flex flex-col h-full"
          >
            <div className={`w-14 h-14 bg-${card.color}-100 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform`}>
              {card.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">{card.title}</h3>
            <p className="text-slate-500 mb-6 flex-1">{card.desc}</p>
            <div className="flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all">
              Explore Now <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </div>
          </button>
        ))}
      </div>

      <section className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-6">
            <h3 className="text-3xl font-bold">Quick Finance Guide: GST ITC Basics</h3>
            <p className="text-slate-300 text-lg">
              আমাদের Senior CA Advisor এর মাধ্যমে আপনি শিখতে পারবেন কিভাবে সঠিক ভাবে 
              <span className="text-blue-400 font-mono"> Input Tax Credit (ITC)</span> দাবি করবেন এবং 
              <span className="text-blue-400 font-mono"> Reconcile</span> করবেন।
            </p>
            <div className="flex flex-wrap gap-4">
              <span className="bg-slate-800 px-4 py-2 rounded-lg text-sm font-medium border border-slate-700">#GST_Compliance</span>
              <span className="bg-slate-800 px-4 py-2 rounded-lg text-sm font-medium border border-slate-700">#Tax_Optimization</span>
              <span className="bg-slate-800 px-4 py-2 rounded-lg text-sm font-medium border border-slate-700">#Audit_Ready</span>
            </div>
          </div>
          <div className="w-full md:w-1/3 bg-white/10 backdrop-blur-sm p-6 rounded-3xl border border-white/10">
             <div className="space-y-4">
               <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                 <p className="text-sm font-semibold">Conversational Bengali Explanations</p>
               </div>
               <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                 <p className="text-sm font-semibold">Real-time Grounded Search Data</p>
               </div>
               <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                 <p className="text-sm font-semibold">Python & Excel Automation Blocks</p>
               </div>
             </div>
          </div>
        </div>
        {/* Background blobs */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px]"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px]"></div>
      </section>
    </div>
  );
};

export default Dashboard;
