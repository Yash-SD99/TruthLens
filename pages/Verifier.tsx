import React, { useState, useRef } from 'react';
import { GeminiService } from '../services/geminiService';
import { VerificationResult, VerdictType } from '../types';
import { VERDICT_COLORS } from '../constants';

interface VerifierProps {
  geminiService: GeminiService | null;
}

export const Verifier: React.FC<VerifierProps> = ({ geminiService }) => {
  const [mode, setMode] = useState<'TEXT' | 'IMAGE'>('TEXT');
  const [inputText, setInputText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setResult(null); // Clear previous result
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerify = async () => {
    if (!geminiService) return;
    setLoading(true);
    setResult(null);

    try {
      if (mode === 'TEXT') {
        if (!inputText.trim()) return;
        const res = await geminiService.verifyText(inputText);
        setResult(res);
      } else {
        if (!imagePreview) return;
        // Remove data URL prefix for API
        const base64 = imagePreview.split(',')[1];
        const res = await geminiService.verifyImage(base64, inputText); // optional text context
        setResult(res);
      }
    } catch (e) {
      alert("Verification failed. Ensure API key is set and valid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Truth Check</h1>
        <p className="text-gray-500 mt-2">Verify articles, claims, or images instantly with AI.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => { setMode('TEXT'); setResult(null); }}
            className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${
              mode === 'TEXT' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📝 Text / Link Verification
          </button>
          <button
            onClick={() => { setMode('IMAGE'); setResult(null); }}
            className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${
              mode === 'IMAGE' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🖼️ Image Analysis
          </button>
        </div>

        <div className="p-6 md:p-8">
          {/* Input Area */}
          <div className="mb-6">
            {mode === 'TEXT' ? (
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste a headline, article text, or specific claim here..."
                className="w-full h-40 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-700"
              />
            ) : (
              <div className="flex flex-col items-center">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${
                    imagePreview ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                  }`}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-full object-contain rounded-lg" />
                  ) : (
                    <>
                      <span className="text-4xl mb-2">📤</span>
                      <p className="text-gray-500 font-medium">Click to upload image</p>
                      <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG</p>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                />
                <input
                  type="text"
                  placeholder="Optional: Add context about where you found this..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full mt-4 p-3 rounded-lg border border-gray-200 text-sm"
                />
              </div>
            )}
          </div>

          <button
            onClick={handleVerify}
            disabled={loading || !geminiService}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform hover:-translate-y-0.5 ${
              loading || !geminiService ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing Truth...
              </span>
            ) : (
              'Verify Now'
            )}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="mt-8 animate-fade-in-up">
          <div className={`bg-white rounded-2xl shadow-lg border-2 overflow-hidden ${VERDICT_COLORS[result.verdict].split(' ')[2]}`}>
            <div className={`p-6 border-b flex items-center justify-between ${VERDICT_COLORS[result.verdict].split(' ')[0]}`}>
              <div className="flex items-center space-x-4">
                <div className={`text-3xl p-3 rounded-full bg-white shadow-sm`}>
                  {result.verdict === VerdictType.REAL ? '✅' : result.verdict === VerdictType.FAKE ? '❌' : '⚠️'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{result.verdict}</h2>
                  <p className="text-sm opacity-75 font-medium">Confidence: {result.confidence}%</p>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Summary</h3>
                <p className="text-lg text-gray-800 leading-relaxed">{result.summary}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Key Evidence</h3>
                <ul className="space-y-3">
                  {result.evidence.map((point, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-blue-500 mr-2 mt-1">✓</span>
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {result.sources.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Sources</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.sources.map((source, idx) => (
                      <a 
                        key={idx} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center px-3 py-2 bg-gray-50 rounded-lg text-sm text-blue-600 hover:bg-blue-50 border border-gray-100 transition-colors"
                      >
                        <span className="truncate max-w-[200px]">{source.title}</span>
                        <span className="ml-2 text-xs">↗</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
