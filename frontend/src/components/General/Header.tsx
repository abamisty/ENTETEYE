// components/General/Header.tsx
"use client";
import React, { useState } from "react";
import {
  Search,
  Bell,
  User,
  ChevronDown,
  Settings,
  LogOut,
  UserCircle,
} from "lucide-react";

const Header: React.FC<{ user: any }> = () => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      id: 1,
      title: "New Achievement Unlocked!",
      message: "Emma completed the Honesty Heroes challenge",
      time: "2 min ago",
      unread: true,
    },
    {
      id: 2,
      title: "Weekly Report Ready",
      message: "Your family's progress report is available",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 3,
      title: "Payment Successful",
      message: "Monthly subscription renewed",
      time: "2 days ago",
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6 relative z-30">
      <div className="flex items-center space-x-4 flex-1">
        <div className="relative max-w-md w-full">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search courses, challenges, family members..."
            className="pl-10 pr-4 py-2 w-full bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f9cf9] focus:border-transparent transition-all duration-200 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                      notification.unread ? "bg-blue-50/50" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-800">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                      </div>
                      {notification.unread && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 ml-2"></div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {notification.time}
                    </p>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-gray-100">
                <button className="text-sm text-[#4f9cf9] hover:text-[#043873] font-medium">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center space-x-3 pl-4 border-l border-gray-200 hover:bg-gray-50 rounded-lg p-2 transition-colors duration-200"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-[#043873] to-[#4f9cf9] rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-700">Sarah Johnson</p>
              <p className="text-xs text-gray-500">Parent Account</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {/* Profile Dropdown */}
          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="font-semibold text-gray-800">Sarah Johnson</p>
                <p className="text-sm text-gray-500">sarah.johnson@email.com</p>
                <p className="text-xs text-[#4f9cf9] mt-1">Premium Plan</p>
              </div>

              <div className="py-2">
                <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3">
                  <UserCircle className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">View Profile</span>
                </button>
                <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3">
                  <Settings className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    Account Settings
                  </span>
                </button>
              </div>

              <div className="border-t border-gray-100 pt-2">
                <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 text-red-600">
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showProfileDropdown || showNotifications) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowProfileDropdown(false);
            setShowNotifications(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;
