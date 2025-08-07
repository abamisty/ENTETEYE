import React from "react";
import {
  Home,
  ArrowLeft,
  Search,
  BookOpen,
  Heart,
  Star,
  Compass,
} from "lucide-react";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Header with Logo */}
        <div className="mb-8">
          <div className="text-3xl font-bold text-gray-900 mb-2">
            <span className="text-primary-main">ENTETEYE</span>
          </div>
          <p className="text-gray-600">
            Character Building • Life Skills • Family Values
          </p>
        </div>

        {/* Main 404 Content */}
        <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-6 left-6 text-primary-main/10">
            <Star size={48} fill="currentColor" />
          </div>
          <div className="absolute top-6 right-6 text-primary-secondary/10">
            <Heart size={48} fill="currentColor" />
          </div>
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-blue-400/10">
            <Compass size={64} />
          </div>

          {/* 404 Number */}
          <div className="relative z-10">
            <div className="text-8xl md:text-9xl font-bold text-primary-main mb-6 leading-none">
              4<span className="text-primary-secondary">0</span>4
            </div>

            {/* Friendly Message */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Oops! This Path Isn't on Our Learning Map
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              It looks like you've wandered off the trail! Don't worry—even the
              greatest explorers take a wrong turn sometimes. Let's get you back
              on track to continue your character-building journey.
            </p>

            {/* Character Lesson */}
            <div className="bg-gradient-to-r from-primary-main/10 to-primary-secondary/10 rounded-2xl p-6 mb-8 border border-primary-main/20">
              <div className="flex items-center justify-center mb-3">
                <BookOpen className="text-primary-main mr-2" size={24} />
                <span className="font-semibold text-primary-main">
                  Character Moment
                </span>
              </div>
              <p className="text-gray-700 font-medium">
                "When we encounter obstacles or get lost, it's how we respond
                that builds our character. Persistence and asking for help are
                signs of wisdom, not weakness."
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button className="bg-primary-main text-white px-8 py-4 rounded-xl hover:bg-green-700 transition-all duration-300 flex items-center justify-center group shadow-lg">
                <Home size={20} className="mr-2" />
                Return to Dashboard
                <div className="ml-2 transform group-hover:translate-x-1 transition-transform">
                  →
                </div>
              </button>

              <button className="border-2 border-primary-main text-primary-main px-8 py-4 rounded-xl hover:bg-primary-main hover:text-white transition-all duration-300 flex items-center justify-center">
                <ArrowLeft size={20} className="mr-2" />
                Go Back
              </button>
            </div>

            {/* Search Suggestions */}
            <div className="border-t border-gray-200 pt-8">
              <p className="text-gray-600 mb-4 flex items-center justify-center">
                <Search size={20} className="mr-2" />
                Maybe you were looking for one of these?
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                <a
                  href="#"
                  className="group bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100 hover:border-primary-main transition-all duration-300"
                >
                  <div className="text-primary-main mb-2">
                    <Heart size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-main transition-colors">
                    Family Values Courses
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Love, respect, communication & more
                  </p>
                </a>

                <a
                  href="#"
                  className="group bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100 hover:border-blue-400 transition-all duration-300"
                >
                  <div className="text-blue-500 mb-2">
                    <Star size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-500 transition-colors">
                    Character Traits
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Integrity, empathy, resilience & more
                  </p>
                </a>

                <a
                  href="#"
                  className="group bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100 hover:border-purple-400 transition-all duration-300"
                >
                  <div className="text-purple-500 mb-2">
                    <BookOpen size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-500 transition-colors">
                    Life Skills
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Financial literacy, communication & more
                  </p>
                </a>
              </div>
            </div>

            {/* Encouraging Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-2 text-primary-main">
                <Compass size={20} />
                <span className="font-medium">
                  Your learning journey continues...
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Support */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 mb-4">
            Still can't find what you're looking for?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="text-primary-main hover:text-green-700 transition-colors font-medium">
              📧 Contact Support
            </button>
            <span className="text-gray-300 hidden sm:inline">•</span>
            <button className="text-primary-main hover:text-green-700 transition-colors font-medium">
              💬 Live Chat
            </button>
            <span className="text-gray-300 hidden sm:inline">•</span>
            <button className="text-primary-main hover:text-green-700 transition-colors font-medium">
              📚 Help Center
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
