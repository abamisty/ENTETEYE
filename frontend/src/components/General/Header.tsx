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
  Star,
  Menu,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/auth";
import Image from "next/image";

const Header: React.FC<{ user: any }> = () => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user } = useAuth();
  const dispatch = useDispatch();
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
  const router = useRouter();
  const handleSignOut = () => {
    localStorage.removeItem("persist:root");
    localStorage.removeItem("token");
    dispatch(logout());
    router.push("/login");
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 relative z-30">
      {/* Mobile menu button */}
      <button
        className="sm:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
        onClick={() => setShowMobileMenu(!showMobileMenu)}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Logo and search */}
      <div className="flex items-center space-x-4 flex-1">
        <div className="flex items-center h-full space-x-3 mr-[3rem]">
          <div className="w-max h-max rounded-lg flex items-center justify-center">
            <Image src={"/logo.png"} alt="Enteteye" width={70} height={70} />
          </div>
          <div className="hidden  justify-center items-center   h-full  sm:flex">
            <h1 className="text-lg h-full font-bold relative top-[6px] text-primary-main">
              ENTETEYE
            </h1>
          </div>
        </div>
        <div className="relative max-w-md w-full hidden md:block">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search courses, challenges, family members..."
            className="pl-10 pr-4 py-2 w-full bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f9cf9] focus:border-transparent transition-all duration-200 text-sm"
          />
        </div>
      </div>

      {/* Mobile search button */}
      <button className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 ml-auto mr-2">
        <Search className="w-5 h-5" />
      </button>

      {/* User controls */}
      <div className="flex items-center space-x-2 sm:space-x-4">
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
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
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

        {/* User Profile - Desktop */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center space-x-3 pl-4 border-l border-gray-200 hover:bg-gray-50 rounded-lg p-2 transition-colors duration-200"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-[#043873] to-[#4f9cf9] rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-sm font-medium text-gray-700">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500">
                {`${user?.role[0].toUpperCase()}${user?.role.slice(1)}`} Account
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 hidden lg:block" />
          </button>

          {/* Profile Dropdown */}
          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="font-semibold text-gray-800">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-gray-500">
                  {user?.role === UserRole.ADMIN || UserRole.PARENT
                    ? user?.email
                    : user?.username}
                </p>
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
                <button
                  onClick={handleSignOut}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile - Mobile */}
        <div className="relative sm:hidden">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-[#043873] to-[#4f9cf9] rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          </button>

          {/* Profile Dropdown - Mobile */}
          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="font-semibold text-gray-800">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-gray-500">
                  {user?.role === UserRole.ADMIN || UserRole.PARENT
                    ? user?.email
                    : user?.username}
                </p>
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
                <button
                  onClick={handleSignOut}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showProfileDropdown || showNotifications || showMobileMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowProfileDropdown(false);
            setShowNotifications(false);
            setShowMobileMenu(false);
          }}
        />
      )}

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="fixed top-16 left-0 right-0 bg-white shadow-md z-30 p-4 border-t border-gray-200 sm:hidden">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search..."
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f9cf9]"
            />
          </div>
          <div className="space-y-2">
            <button className="w-full px-4 py-2 text-left hover:bg-gray-50 rounded-lg">
              Dashboard
            </button>
            <button className="w-full px-4 py-2 text-left hover:bg-gray-50 rounded-lg">
              Courses
            </button>
            <button className="w-full px-4 py-2 text-left hover:bg-gray-50 rounded-lg">
              Challenges
            </button>
            <button className="w-full px-4 py-2 text-left hover:bg-gray-50 rounded-lg">
              Family
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
