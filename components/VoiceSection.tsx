
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { decode, encode, decodeAudioData } from '../services/geminiService';

const VoiceSection: React.FC = () => {
  const [isLive, setIsLive] = useState(false);
  // Using a ref for sessionPromise to follow guidelines and avoid race conditions
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  /**
   * Function to create audio blob as per @google/genai guidelines
   */
  const createBlob = (data: Float32Array) => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const startSession = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = audioContext;
      const outputNode = audioContext.createGain();
      outputNode.connect(audioContext.destination);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsLive(true);
            const source = inputContext.createMediaStreamSource(stream);
            const scriptProcessor = inputContext.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              // CRITICAL: Always use sessionPromise to avoid race conditions and stale closures as per SDK docs
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64EncodedAudioString = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            
            if (base64EncodedAudioString && audioContextRef.current) {
              const ctx = audioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              // Use the helper from geminiService for proper PCM decoding as native decodeAudioData won't work for raw streams
              const audioBuffer = await decodeAudioData(
                decode(base64EncodedAudioString),
                ctx,
                24000,
                1
              );

              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNode);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              for (const source of sourcesRef.current.values()) {
                source.stop();
              }
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error("Live Error:", e);
          },
          onclose: () => {
            setIsLive(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { 
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } 
          },
          systemInstruction: 'You are a Senior CA advisor speaking in Bengali. Be helpful and expert.'
        }
      });

      sessionPromiseRef.current = sessionPromise;

    } catch (err) {
      console.error(err);
      alert("Microphone access denied or session failed.");
    }
  };

  const stopSession = () => {
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => session.close());
    }
    setIsLive(false);
  };

  /**
   * Cleanup on unmount to release resources
   */
  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col items-center justify-center space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-extrabold text-slate-900">Live Voice Consultation</h2>
        <p className="text-slate-600 max-w-md mx-auto">
          আমাদের Senior Advisor এর সাথে সরাসরি কথা বলুন। Accounting জটিলতা নিয়ে Bengali তে আলোচনা করুন।
        </p>
      </div>

      <div className={`relative w-64 h-64 rounded-full flex items-center justify-center transition-all duration-500 ${
        isLive ? 'bg-blue-600 shadow-[0_0_50px_rgba(37,99,235,0.4)]' : 'bg-slate-200'
      }`}>
        {isLive && (
          <>
            <div className="absolute inset-0 rounded-full border-4 border-blue-400 animate-ping opacity-20"></div>
            <div className="absolute inset-[-20px] rounded-full border-2 border-blue-400 animate-ping opacity-10 delay-300"></div>
          </>
        )}
        
        <button
          onClick={isLive ? stopSession : startSession}
          className={`w-48 h-48 rounded-full flex flex-col items-center justify-center text-white transition-all shadow-xl z-10 ${
            isLive ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          <span className="text-5xl mb-2">{isLive ? '⏹' : '🎙️'}</span>
          <span className="font-bold tracking-widest">{isLive ? 'STOP SESSION' : 'START CALL'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {[
          { icon: "⚡", label: "Low Latency", desc: "Real-time interactions" },
          { icon: "🗣️", label: "Bengali Native", desc: "Speak naturally" },
          { icon: "🔒", label: "Secure", desc: "Private audit advice" }
        ].map((feat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center">
            <div className="text-2xl mb-2">{feat.icon}</div>
            <h4 className="font-bold text-slate-800">{feat.label}</h4>
            <p className="text-xs text-slate-500 mt-1">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VoiceSection;
