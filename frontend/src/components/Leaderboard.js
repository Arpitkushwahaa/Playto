import React, { useState, useEffect } from 'react';
import { feedAPI } from '../api';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLeaderboard();
    // Refresh leaderboard every 30 seconds
    const interval = setInterval(loadLeaderboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadLeaderboard = async () => {
    try {
      const response = await feedAPI.getLeaderboard();
      setLeaderboard(response.data);
      setLoading(false);
      setError(null);
    } catch (err) {
      setError('Failed to load leaderboard');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">🏆 Top Users (24h)</h2>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">🏆 Top Users (24h)</h2>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const getMedalEmoji = (index) => {
    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
    return medals[index] || '';
  };

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg p-6 sticky top-6 border border-blue-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <span className="mr-2 text-3xl">🏆</span> 
          <span className="bg-gradient-to-r from-blue-500 to-blue-500 bg-clip-text text-transparent">Top Contributors</span>
        </h2>
        <span className="text-xs bg-blue-100 text-blue-500 px-3 py-1 rounded-full font-semibold">24h</span>
      </div>
      
      {leaderboard.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🌟</div>
          <p className="text-gray-500 text-sm">No activity yet. Be the first to post and comment!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((user, index) => (
            <div
              key={user.user_id}
              className={`p-4 rounded-xl transition-all duration-300 hover:scale-105 ${
                index === 0
                  ? 'bg-gradient-to-r from-yellow-100 via-yellow-50 to-orange-100 border-2 border-yellow-400 shadow-lg'
                  : index === 1
                  ? 'bg-gradient-to-r from-gray-100 via-gray-50 to-slate-100 border-2 border-gray-400 shadow-md'
                  : index === 2
                  ? 'bg-gradient-to-r from-orange-100 via-orange-50 to-amber-100 border-2 border-orange-400 shadow-md'
                  : 'bg-white border-2 border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className={`text-3xl ${index < 3 ? 'animate-bounce' : ''}`}>
                    {getMedalEmoji(index)}
                  </span>
                  <div>
                    <p className={`font-bold ${index < 3 ? 'text-gray-900 text-lg' : 'text-gray-800'}`}>
                      {user.username}
                    </p>
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                      <span className={`font-bold ${index < 3 ? 'text-blue-500 text-base' : 'text-blue-500 text-sm'}`}>
                        {user.karma} karma
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-xs text-gray-600 mb-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd"></path>
                    </svg>
                    <span className="font-semibold text-green-600">{user.post_karma}</span> posts
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-gray-600">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"></path>
                    </svg>
                    <span className="font-semibold text-blue-500">{user.comment_karma}</span> comments
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6 pt-4 border-t border-blue-300">
        <p className="text-xs text-gray-500 text-center">
          🔄 Auto-updates every 30 seconds
        </p>
      </div>
    </div>
  );
};

export default Leaderboard;
