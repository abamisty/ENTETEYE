// components/General/SideBar.tsx
"use client";
import React, { useState } from "react";
import {
  Home,
  BookOpen,
  Users,
  Trophy,
  Settings,
  CreditCard,
  BarChart3,
  Star,
  Target,
  MessageCircle,
  Menu,
  X,
} from "lucide-react";

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  href?: string;
}

const SideBar: React.FC<{ userRole: any }> = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeItem, setActiveItem] = useState("dashboard");

  const navigationItems: NavigationItem[] = [
    { id: "dashboard", label: "Dashboard", icon: Home, href: "/dashboard" },
    {
      id: "courses",
      label: "Courses",
      icon: BookOpen,
      badge: "3",
      href: "/courses",
    },
    {
      id: "challenges",
      label: "Challenges",
      icon: Target,
      href: "/challenges",
    },
    { id: "family", label: "Family", icon: Users, href: "/family" },
    {
      id: "achievements",
      label: "Achievements",
      icon: Trophy,
      badge: "12",
      href: "/achievements",
    },
    { id: "progress", label: "Progress", icon: BarChart3, href: "/progress" },
    {
      id: "messages",
      label: "Messages",
      icon: MessageCircle,
      badge: "2",
      href: "/messages",
    },
  ];

  const bottomItems: NavigationItem[] = [
    { id: "billing", label: "Billing", icon: CreditCard, href: "/billing" },
    { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
  ];

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId);
    // You can add navigation logic here
    // Example: router.push(item.href)
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className={`bg-white shadow-lg transition-all duration-300 ease-in-out ${
        isOpen ? "w-64" : "w-16"
      } flex flex-col relative z-20`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {isOpen ? (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-[#043873] to-[#4f9cf9] rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#043873]">
                  FVLS Academy
                </h1>
                <p className="text-xs text-gray-500">Learning Platform</p>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 bg-gradient-to-r from-[#043873] to-[#4f9cf9] rounded-lg flex items-center justify-center mx-auto">
              <Star className="w-5 h-5 text-white" />
            </div>
          )}

          {/* Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors duration-200 ml-2"
          >
            {isOpen ? (
              <X className="w-4 h-4 text-gray-600" />
            ) : (
              <Menu className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                activeItem === item.id
                  ? "bg-gradient-to-r from-[#043873] to-[#4f9cf9] text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100 hover:text-[#043873]"
              }`}
              title={!isOpen ? item.label : undefined}
            >
              <Icon
                className={`w-5 h-5 ${isOpen ? "" : "mx-auto"} flex-shrink-0`}
              />
              {isOpen && (
                <>
                  <span className="font-medium flex-1 truncate">
                    {item.label}
                  </span>
                  {item.badge && (
                    <span
                      className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ${
                        activeItem === item.id
                          ? "bg-white/20 text-white"
                          : "bg-[#4f9cf9] text-white"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {!isOpen && item.badge && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#4f9cf9] rounded-full"></span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                activeItem === item.id
                  ? "bg-gradient-to-r from-[#043873] to-[#4f9cf9] text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100 hover:text-[#043873]"
              }`}
              title={!isOpen ? item.label : undefined}
            >
              <Icon
                className={`w-5 h-5 ${isOpen ? "" : "mx-auto"} flex-shrink-0`}
              />
              {isOpen && (
                <span className="font-medium truncate">{item.label}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* User Profile Section (when collapsed) */}
      {!isOpen && (
        <div className="p-4 border-t border-gray-200">
          <div className="w-8 h-8 bg-gradient-to-r from-[#043873] to-[#4f9cf9] rounded-full flex items-center justify-center mx-auto">
            <span className="text-white text-sm font-medium">SJ</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SideBar;
