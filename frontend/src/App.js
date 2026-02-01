import React from 'react';
import Feed from './components/Feed';
import Leaderboard from './components/Leaderboard';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              Community Feed
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                <span className="font-semibold">Post Like:</span> 5 karma
              </span>
              <span className="text-sm text-gray-400">|</span>
              <span className="text-sm text-gray-600">
                <span className="font-semibold">Comment Like:</span> 1 karma
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Feed Section */}
          <div className="lg:col-span-2">
            <Feed />
          </div>

          {/* Leaderboard Section */}
          <div className="lg:col-span-1">
            <Leaderboard />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 text-sm">
            Built with Django, DRF, React, and Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
