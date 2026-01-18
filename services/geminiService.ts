
import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";

export const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const SYSTEM_INSTRUCTION = `You are "Senior CA & Financial Tech Expert" with 20+ years of experience.
Expertise: Tally Prime, Zoho Books, Advanced Excel (VBA), Python for Finance, GST, ITR, Audit.
Language: Bengali (conversational).
Technical Terms: Keep in English (e.g., Input Tax Credit, Pivot Table).
Structure: Use Tables for comparisons. Bullet points for steps.
Approach: Easy steps for basics, advanced logic/code for pro questions.
Always explain the "Why". If risky, add "Caution".`;

/**
 * Helper to decode base64 to Uint8Array
 */
export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Helper to encode Uint8Array to base64
 */
export function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Helper to decode raw PCM audio data into an AudioBuffer
 */
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const generateExpertResponse = async (
  prompt: string, 
  useThinking: boolean = false, 
  useSearch: boolean = false,
  useMaps: boolean = false,
  location?: { lat: number, lng: number }
) => {
  const ai = getAI();
  const modelName = useThinking ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  
  const config: any = {
    systemInstruction: SYSTEM_INSTRUCTION,
    tools: []
  };

  if (useThinking) {
    config.thinkingConfig = { thinkingBudget: 32768 };
  }

  if (useSearch) {
    config.tools.push({ googleSearch: {} });
  }

  if (useMaps && location) {
    config.tools.push({ googleMaps: {} });
    config.toolConfig = {
      retrievalConfig: {
        latLng: {
          latitude: location.lat,
          longitude: location.lng
        }
      }
    };
  }

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config
  });

  return response;
};

export const generateExpertImage = async (
  prompt: string, 
  aspectRatio: string = "1:1", 
  imageSize: string = "1K"
) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
        imageSize: imageSize as any
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const editExpertImage = async (
  base64Image: string,
  instruction: string,
  mimeType: string = 'image/png'
) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(',')[1], mimeType } },
        { text: instruction }
      ]
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const generateExpertVideo = async (prompt: string, aspectRatio: '16:9' | '9:16' = '16:9') => {
  const ai = getAI();
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  const res = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
};

export const analyzeMedia = async (mediaBase64: string, prompt: string, mimeType: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { data: mediaBase64.split(',')[1], mimeType } },
        { text: prompt }
      ]
    },
    config: { systemInstruction: SYSTEM_INSTRUCTION }
  });
  return response.text;
};

export const generateExpertSpeech = async (text: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};
