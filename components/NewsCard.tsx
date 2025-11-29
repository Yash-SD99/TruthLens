import React from 'react';
import { NewsArticle, VerdictType } from '../types';
import { VERDICT_COLORS } from '../constants';

interface NewsCardProps {
  article: NewsArticle;
}

export const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col h-full group">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={article.imageUrl} 
          alt={article.title} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${VERDICT_COLORS[article.verdict]}`}>
            {article.verdict}
          </span>
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase">{article.source}</span>
          <span className="mx-2 text-gray-300">•</span>
          <span className="text-xs text-gray-400">{new Date(article.publishedAt).toLocaleDateString()}</span>
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
          {article.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
          {article.summary}
        </p>

        {article.verdict === VerdictType.SUSPICIOUS && (
          <div className="mb-4 bg-yellow-50 p-2 rounded-lg border border-yellow-100">
            <p className="text-xs text-yellow-800">
              <strong>⚠️ AI Note:</strong> {article.reasoning}
            </p>
          </div>
        )}
        
        <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
          <div className="flex items-center space-x-1 text-gray-400 text-xs">
             <span>Confidence:</span>
             <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${article.confidenceScore > 80 ? 'bg-green-500' : 'bg-yellow-500'}`} 
                  style={{ width: `${article.confidenceScore}%` }}
                ></div>
             </div>
          </div>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
            Read Full <span className="ml-1">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};
