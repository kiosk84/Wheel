import React from 'react';

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 z-50">
      <div className="flex flex-col items-center">
        <div className="text-4xl font-bold text-white animate-pulse">SpinWheel</div>
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mt-4" />
      </div>
    </div>
  );
}
