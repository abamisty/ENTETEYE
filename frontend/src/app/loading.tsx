// ===== FIXED NEXT.JS LOADING FILES =====

// app/loading.tsx (Root level loading)
import React from "react";
import { Loader2, Star, BookOpen, Trophy, Users } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="relative mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-primary-main to-primary-secondary rounded-2xl flex items-center justify-center mx-auto animate-pulse">
            <Star className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Spinning Icons */}
        <div className="flex justify-center space-x-4 mb-6">
          {[BookOpen, Trophy, Users].map((Icon, index) => (
            <div
              key={index}
              className="w-8 h-8 text-[#4f9cf9] animate-bounce"
              style={{
                animationDelay: `${index * 0.2}s`,
                animationDuration: "1s",
              }}
            >
              <Icon className="w-full h-full" />
            </div>
          ))}
        </div>

        {/* Loading Text */}
        <h2 className="text-xl font-semibold text-[#043873] mb-2">
          FVLS Academy
        </h2>
        <p className="text-gray-600 animate-pulse">
          Loading your learning journey...
        </p>

        {/* Progress Bar */}
        <div className="w-64 h-1 bg-gray-200 rounded-full mx-auto mt-6 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#043873] to-[#4f9cf9] rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
