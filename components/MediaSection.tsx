
import React, { useState } from 'react';
import { generateExpertImage, editExpertImage, generateExpertVideo } from '../services/geminiService';

interface MediaSectionProps {
  onNeedKey: () => void;
}

const MediaSection: React.FC<MediaSectionProps> = ({ onNeedKey }) => {
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'edit'>('image');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [imageSize, setImageSize] = useState('1K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [editInstruction, setEditInstruction] = useState('');

  const handleGenerateImage = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setResult(null);
    try {
      const url = await generateExpertImage(prompt, aspectRatio, imageSize);
      setResult(url);
    } catch (err) {
      console.error(err);
      alert("Generation failed. Check console for details.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setResult(null);
    try {
      const url = await generateExpertVideo(prompt, aspectRatio as any);
      setResult(url);
    } catch (err) {
      console.error(err);
      alert("Video generation failed. This process usually takes 1-3 minutes.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditImage = async () => {
    if (!selectedFile || !editInstruction.trim()) return;
    setIsGenerating(true);
    setResult(null);
    try {
      const url = await editExpertImage(selectedFile, editInstruction);
      setResult(url);
    } catch (err) {
      console.error(err);
      alert("Edit failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setSelectedFile(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 h-full items-start">
      {/* Controls */}
      <div className="lg:col-span-1 space-y-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {(['image', 'video', 'edit'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setResult(null); }}
              className={`flex-1 py-2 rounded-lg text-sm font-bold capitalize transition ${
                activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {activeTab === 'edit' ? (
            <>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Upload Reference Image</label>
                <input 
                  type="file" 
                  onChange={handleFileUpload}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Edit Instruction</label>
                <textarea
                  value={editInstruction}
                  onChange={(e) => setEditInstruction(e.target.value)}
                  placeholder="e.g., Add a futuristic glowing graph to this office setting..."
                  className="w-full p-4 border rounded-2xl h-32 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Creative Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={activeTab === 'image' ? "Professional financial analyst at a 4K resolution desk with holographic data..." : "A cinematic 16:9 video of stock market candles glowing in a dark room..."}
                  className="w-full p-4 border rounded-2xl h-32 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Aspect Ratio</label>
                <select 
                  value={aspectRatio} 
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full p-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1:1">1:1 Square</option>
                  <option value="16:9">16:9 Landscape</option>
                  <option value="9:16">9:16 Portrait</option>
                  <option value="4:3">4:3 Desktop</option>
                </select>
              </div>

              {activeTab === 'image' && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Quality Resolution</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['1K', '2K', '4K'].map(size => (
                      <button
                        key={size}
                        onClick={() => setImageSize(size)}
                        className={`py-2 rounded-lg text-xs font-bold border transition ${
                          imageSize === size ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <button
            onClick={activeTab === 'image' ? handleGenerateImage : activeTab === 'video' ? handleGenerateVideo : handleEditImage}
            disabled={isGenerating}
            className={`w-full py-4 rounded-2xl font-bold text-white transition-all shadow-lg ${
              isGenerating ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
            }`}
          >
            {isGenerating ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : (
              `Generate ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`
            )}
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="lg:col-span-2 bg-slate-100 rounded-[2.5rem] border-4 border-white shadow-inner flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden">
        {result ? (
          activeTab === 'video' ? (
            <video src={result} controls className="max-h-full max-w-full rounded-2xl shadow-2xl" autoPlay loop />
          ) : (
            <img src={result} alt="Generated asset" className="max-h-full max-w-full rounded-2xl shadow-2xl" />
          )
        ) : (
          <div className="text-center space-y-4 px-10">
            <div className="text-6xl mb-4">✨</div>
            <h3 className="text-2xl font-bold text-slate-800">Ready to Visualize?</h3>
            <p className="text-slate-500 max-w-sm">
              Your professional assets will appear here. High-resolution generations may take up to 2 minutes.
            </p>
          </div>
        )}

        {isGenerating && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-20">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-blue-800 font-bold">Senior Advisor AI is crafting your visual...</p>
              <div className="text-xs text-blue-600 animate-pulse uppercase tracking-widest font-bold">
                Analyzing pixels • Rendering details • Optimizing lighting
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaSection;
