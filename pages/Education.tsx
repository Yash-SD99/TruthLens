import React from 'react';

export const Education: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900">Media Literacy Hub</h1>
        <p className="text-gray-500 mt-2">Master the art of spotting misinformation.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
          <h2 className="text-2xl font-bold mb-4">The S.I.F.T. Method</h2>
          <p className="mb-6 opacity-90">A four-step strategy to analyze news in digital environments.</p>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-white/20 p-2 rounded-lg font-bold mr-4 w-10 text-center">S</div>
              <div>
                <h3 className="font-bold">Stop</h3>
                <p className="text-sm opacity-80">Check your emotions. Don't share immediately.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-white/20 p-2 rounded-lg font-bold mr-4 w-10 text-center">I</div>
              <div>
                <h3 className="font-bold">Investigate the Source</h3>
                <p className="text-sm opacity-80">Who are they? What is their agenda?</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-white/20 p-2 rounded-lg font-bold mr-4 w-10 text-center">F</div>
              <div>
                <h3 className="font-bold">Find Better Coverage</h3>
                <p className="text-sm opacity-80">What do reputable outlets say?</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-white/20 p-2 rounded-lg font-bold mr-4 w-10 text-center">T</div>
              <div>
                <h3 className="font-bold">Trace to Original</h3>
                <p className="text-sm opacity-80">Click through to the primary citation.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Spotting Deepfakes</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
              <div className="text-2xl mb-2">👀</div>
              <h3 className="font-bold text-gray-900 mb-1">Unnatural Blinking</h3>
              <p className="text-xs text-gray-600">Subjects may blink too much, too little, or unnaturally.</p>
            </div>
            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
              <div className="text-2xl mb-2">🦷</div>
              <h3 className="font-bold text-gray-900 mb-1">Teeth & Skin</h3>
              <p className="text-xs text-gray-600">Look for blurring, inconsistent textures, or overly perfect teeth.</p>
            </div>
            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
              <div className="text-2xl mb-2">👂</div>
              <h3 className="font-bold text-gray-900 mb-1">Lip Sync</h3>
              <p className="text-xs text-gray-600">Audio may not perfectly match the mouth movements.</p>
            </div>
            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
              <div className="text-2xl mb-2">💡</div>
              <h3 className="font-bold text-gray-900 mb-1">Lighting</h3>
              <p className="text-xs text-gray-600">Shadows on the face might not match the environment.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Test Your Skills</h2>
        <p className="text-gray-600 mb-6">Take our interactive quiz to see if you can distinguish real news from fake.</p>
        <button className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-blue-700 transition-colors">
          Start Quiz (Coming Soon)
        </button>
      </div>
    </div>
  );
};
