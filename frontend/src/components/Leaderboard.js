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
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
        <span className="mr-2">🏆</span> Top Users (24h)
      </h2>
      
      {leaderboard.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No activity in the last 24 hours</p>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((user, index) => (
            <div
              key={user.user_id}
              className={`p-4 rounded-lg transition-all duration-200 ${
                index === 0
                  ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-300'
                  : index === 1
                  ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-300'
                  : index === 2
                  ? 'bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-300'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getMedalEmoji(index)}</span>
                  <div>
                    <p className="font-semibold text-gray-800">{user.username}</p>
                    <p className="text-sm text-gray-600">
                      {user.karma} karma
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-primary-600">{user.post_karma}</span> posts
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-primary-600">{user.comment_karma}</span> comments
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Updates every 30 seconds
        </p>
      </div>
    </div>
  );
};

export default Leaderboard;
