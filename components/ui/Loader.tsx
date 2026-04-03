"use client";

export default function Loader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-page">
      <div className="flex flex-col items-center gap-6">
        
        {/* Animated Gradient Ring */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-transparent border-t-blue-500 border-r-purple-500 animate-spin"></div>
          
          {/* Inner Pulse */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Text */}
        <p className="text-sm text-gray-500 tracking-wide animate-pulse">
          Loading awesome content...
        </p>
      </div>
    </div>
  );
}