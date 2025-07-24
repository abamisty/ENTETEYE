// app/dashboard/page.tsx (or wherever your dashboard content goes)
"use client";
import React from "react";

const DashboardPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#043873] to-[#4f9cf9] rounded-xl p-6 text-white mb-6">
        <h2 className="text-2xl font-bold mb-2">Welcome back, Sarah! 👋</h2>
        <p className="text-white/90">
          Your family has completed 3 challenges this week. Keep up the great
          work!
        </p>
        <div className="mt-4 flex space-x-4">
          <div className="bg-white/20 rounded-lg p-3">
            <div className="text-sm opacity-90">Weekly Streak</div>
            <div className="text-xl font-bold">7 days</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <div className="text-sm opacity-90">Points Earned</div>
            <div className="text-xl font-bold">2,450</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <div className="text-sm opacity-90">Badges</div>
            <div className="text-xl font-bold">12</div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Current Challenges
            </h3>
            <div className="space-y-4">
              {[
                {
                  title: "Honesty Heroes",
                  progress: 75,
                  type: "Character Building",
                },
                { title: "Courage Quest", progress: 45, type: "Bravery" },
                {
                  title: "Speaking Stars",
                  progress: 90,
                  type: "Public Speaking",
                },
              ].map((challenge, index) => (
                <div
                  key={index}
                  className="border border-gray-100 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-800">
                        {challenge.title}
                      </h4>
                      <p className="text-sm text-gray-500">{challenge.type}</p>
                    </div>
                    <span className="text-sm font-medium text-[#4f9cf9]">
                      {challenge.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#043873] to-[#4f9cf9] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${challenge.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Family Progress
            </h3>
            <div className="space-y-3">
              {[
                { name: "Emma (8)", progress: 85, color: "bg-pink-500" },
                { name: "Lucas (12)", progress: 92, color: "bg-blue-500" },
                { name: "You", progress: 78, color: "bg-green-500" },
              ].map((member, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {member.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {member.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${member.color} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${member.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Recent Achievements
            </h3>
            <div className="space-y-3">
              {[
                {
                  badge: "🏆",
                  title: "Truth Teller",
                  subtitle: "Completed Honesty module",
                },
                {
                  badge: "🌟",
                  title: "Brave Heart",
                  subtitle: "Faced a fear challenge",
                },
                {
                  badge: "🎯",
                  title: "Goal Getter",
                  subtitle: "Set and achieved goal",
                },
              ].map((achievement, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="text-2xl">{achievement.badge}</div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {achievement.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {achievement.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
