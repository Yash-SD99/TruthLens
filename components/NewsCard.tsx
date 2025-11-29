
import React, { useState } from 'react';
import { NewsArticle, VerdictType } from '../types';
import { VERDICT_COLORS } from '../constants';

interface NewsCardProps {
  article: NewsArticle;
}

export const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  const [showAnalysis, setShowAnalysis] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col h-full group">
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img 
          src={article.imageUrl} 
          alt={article.title} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 z-10">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider shadow-sm ${VERDICT_COLORS[article.verdict]}`}>
            {article.verdict}
          </span>
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        {/* Header Info */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
            {article.source}
          </span>
          <span className="text-xs text-gray-400">{new Date(article.publishedAt).toLocaleDateString()}</span>
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
          {article.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {article.summary}
        </p>

        {/* AGENT ANALYSIS TOGGLE */}
        <div className="mt-auto">
          <button 
            onClick={() => setShowAnalysis(!showAnalysis)}
            className="w-full text-left text-xs font-semibold text-gray-500 hover:text-blue-600 flex items-center justify-between py-2 border-t border-gray-50"
          >
            <span>🤖 Agent Analysis Breakdown</span>
            <span>{showAnalysis ? '▼' : '▶'}</span>
          </button>

          {showAnalysis && (
            <div className="mt-2 bg-gray-50 rounded-lg p-3 text-xs space-y-3 animate-fade-in">
              {/* Agent 2: Source */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-gray-700">Agent 2 (Source):</span>
                  <span className={`font-mono ${article.agentAnalysis.sourceScore > 70 ? 'text-green-600' : 'text-amber-600'}`}>
                    {article.agentAnalysis.sourceScore}/100
                  </span>
                </div>
                <p className="text-gray-500 leading-tight">{article.agentAnalysis.sourceNotes}</p>
              </div>

              {/* Agent 3: Content */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-gray-700">Agent 3 (Content):</span>
                  <span className={`font-mono ${article.agentAnalysis.contentScore > 70 ? 'text-green-600' : 'text-amber-600'}`}>
                    {article.agentAnalysis.contentScore}/100
                  </span>
                </div>
                <p className="text-gray-500 leading-tight">{article.agentAnalysis.contentNotes}</p>
              </div>

              {/* Agent 4: Verdict */}
              <div className="pt-2 border-t border-gray-200">
                 <span className="font-bold text-gray-700 block mb-1">Agent 4 (Verdict):</span>
                 <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                    <div 
                      className={`h-1.5 rounded-full ${article.confidenceScore > 80 ? 'bg-green-500' : 'bg-blue-500'}`} 
                      style={{ width: `${article.confidenceScore}%` }}
                    ></div>
                 </div>
                 <p className="text-gray-500 text-[10px] text-right">{article.confidenceScore}% Confidence</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="pt-4 mt-2 flex justify-end">
          <a 
             href={article.url || '#'} 
             target="_blank" 
             rel="noreferrer"
             className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
          >
            Read Original <span className="ml-1">→</span>
          </a>
        </div>
      </div>
    </div>
  );
};
