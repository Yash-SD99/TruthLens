import React, { useEffect, useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { NewsArticle } from '../types';
import { NewsCard } from '../components/NewsCard';
import { DEFAULT_TOPICS } from '../constants';

interface FeedProps {
  geminiService: GeminiService | null;
  userTopics: string[];
}

export const Feed: React.FC<FeedProps> = ({ geminiService, userTopics }) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      if (!geminiService) return;
      
      setLoading(true);
      setError(null);
      try {
        const activeTopics = userTopics.length > 0 ? userTopics : DEFAULT_TOPICS;
        const result = await geminiService.generateNewsFeed(activeTopics);
        setArticles(result);
      } catch (err) {
        setError("Failed to load curated news. Please check your API key.");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [geminiService, userTopics]);

  if (!geminiService) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
        <div className="bg-blue-50 p-6 rounded-2xl max-w-md">
          <span className="text-4xl mb-4 block">🔑</span>
          <h2 className="text-xl font-bold text-gray-900 mb-2">API Key Required</h2>
          <p className="text-gray-600">Please enter your Gemini API Key in the settings to access the personalized news feed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Briefing</h1>
        <p className="text-gray-500 mt-1">AI-curated news, verified for credibility.</p>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {(userTopics.length ? userTopics : DEFAULT_TOPICS).map(topic => (
            <span key={topic} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-600 shadow-sm">
              #{topic}
            </span>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl h-96 animate-pulse border border-gray-100">
              <div className="h-48 bg-gray-200 rounded-t-xl"></div>
              <div className="p-5 space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600 bg-red-50 rounded-xl">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
};
