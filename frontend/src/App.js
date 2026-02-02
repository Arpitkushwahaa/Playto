import React, { useState, useCallback, useEffect } from 'react';
import Feed from './components/Feed';
import Leaderboard from './components/Leaderboard';
import './index.css';

function App() {
  const [refreshLeaderboard, setRefreshLeaderboard] = useState(0);

  const handlePostCreated = useCallback(() => {
    setRefreshLeaderboard(prev => prev + 1);
  }, []);

  // Keep backend alive by pinging health endpoint every 10 minutes
  useEffect(() => {
    const keepAlive = () => {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      const baseUrl = apiUrl.replace('/api', '');
      fetch(`${baseUrl}/health/`).catch(() => {});
    };

    // Initial ping
    keepAlive();

    // Ping every 10 minutes (600000ms)
    const interval = setInterval(keepAlive, 600000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-500 to-sky-400 shadow-lg sticky top-0 z-10 border-b-4 border-blue-500">`
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md">
                <span className="text-3xl">💬</span>
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-white drop-shadow-md">
                  Community Feed
                </h1>
                <p className="text-blue-50 text-sm">Share, discuss, and connect</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center space-x-6 bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20">
              <div className="text-center">
                <div className="text-white font-bold text-lg">+5</div>
                <div className="text-blue-50 text-xs">Post Like</div>
              </div>
              <div className="h-8 w-px bg-white/30"></div>
              <div className="text-center">
                <div className="text-white font-bold text-lg">+1</div>
                <div className="text-blue-50 text-xs">Comment Like</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Feed Section */}
          <div className="lg:col-span-2">
            <Feed onPostCreated={handlePostCreated} />
          </div>

          {/* Leaderboard Section */}
          <div className="lg:col-span-1">
            <Leaderboard key={refreshLeaderboard} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-500 to-sky-400 border-t-4 border-blue-500 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <span className="text-2xl">⚡</span>
              <p className="text-white font-semibold">Playto Community Challenge</p>
            </div>
            <p className="text-blue-50 text-sm mb-2">
              Built with Django REST Framework, React, and Tailwind CSS
            </p>
            <div className="flex items-center justify-center space-x-4 text-xs text-blue-50">
              <span>✓ Threaded Comments</span>
              <span>•</span>
              <span>✓ Real-time Leaderboard</span>
              <span>•</span>
              <span>✓ Optimized Queries</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
