import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Feed } from './pages/Feed';
import { Verifier } from './pages/Verifier';
import { Education } from './pages/Education';
import { PageView, UserProfile } from './types';
import { GeminiService } from './services/geminiService';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageView>('FEED');
  const [apiKey, setApiKey] = useState<string>('');
  const [geminiService, setGeminiService] = useState<GeminiService | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showKeyModal, setShowKeyModal] = useState(false);

  // Initialize service when key changes
  useEffect(() => {
    const storedKey = sessionStorage.getItem('gemini_api_key');
    if (storedKey) {
      setApiKey(storedKey);
      setGeminiService(new GeminiService(storedKey));
    } else {
      setShowKeyModal(true);
    }

    // Mock User Login persistence
    const storedUser = localStorage.getItem('truthlens_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleSetKey = (key: string) => {
    setApiKey(key);
    sessionStorage.setItem('gemini_api_key', key);
    setGeminiService(new GeminiService(key));
    setShowKeyModal(false);
  };

  const handleLogin = () => {
    // Simulated Firebase Login
    const mockUser: UserProfile = {
      uid: '12345',
      displayName: 'Demo User',
      email: 'user@example.com',
      preferences: { topics: ['Technology', 'AI', 'Science'], strictMode: false },
      history: []
    };
    setUser(mockUser);
    localStorage.setItem('truthlens_user', JSON.stringify(mockUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('truthlens_user');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900">
      <Navbar 
        currentPage={currentPage} 
        setPage={setCurrentPage} 
        isAuthenticated={!!user}
        onLogout={handleLogout}
        onLoginClick={handleLogin}
      />

      <main>
        {currentPage === 'FEED' && (
          <Feed 
            geminiService={geminiService} 
            userTopics={user?.preferences.topics || []} 
          />
        )}
        {currentPage === 'VERIFY' && <Verifier geminiService={geminiService} />}
        {currentPage === 'EDUCATION' && <Education />}
        {currentPage === 'PROFILE' && (
          <div className="max-w-3xl mx-auto p-8">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">User Profile</h2>
              {user ? (
                <div>
                  <div className="flex items-center mb-6">
                    <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mr-4">
                      {user.displayName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-lg">{user.displayName}</p>
                      <p className="text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h3 className="font-bold mb-2">Preferences</h3>
                    <div className="flex flex-wrap gap-2">
                      {user.preferences.topics.map(t => (
                        <span key={t} className="bg-gray-100 px-3 py-1 rounded-full text-sm">{t}</span>
                      ))}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                        sessionStorage.removeItem('gemini_api_key');
                        window.location.reload();
                    }}
                    className="mt-8 text-red-500 text-sm hover:underline"
                  >
                    Clear API Key
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Please sign in to view your profile and save preferences.</p>
                  <button onClick={handleLogin} className="bg-blue-600 text-white px-6 py-2 rounded-full">Sign In (Demo)</button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold mb-4 text-center">Welcome to TruthLens</h2>
            <p className="text-gray-600 mb-6 text-sm text-center">
              To use the AI verification and live news features, please enter your Gemini API Key. 
              The key is stored locally in your session.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); const val = (e.target as any).key.value; if(val) handleSetKey(val); }}>
              <input 
                name="key"
                type="password" 
                placeholder="Enter Gemini API Key" 
                className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                autoFocus
              />
              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Start Verifying
              </button>
            </form>
            <p className="mt-4 text-xs text-center text-gray-400">
              Get a key at <a href="https://aistudio.google.com/" target="_blank" className="underline hover:text-blue-500">Google AI Studio</a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
