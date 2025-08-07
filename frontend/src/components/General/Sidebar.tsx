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
  Settings2Icon,
  BookAIcon,
} from "lucide-react";
import { UserRole } from "@/types/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  href?: string;
  roles?: UserRole[]; // Specify which roles can see this item
}

const SideBar: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeItem, setActiveItem] = useState("dashboard");

  const commonItems: NavigationItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      href: "/",
      roles: [UserRole.ADMIN, UserRole.PARENT, UserRole.CHILD],
    },
  ];

  // Role-specific navigation items
  const roleSpecificItems: Record<UserRole, NavigationItem[]> = {
    [UserRole.ADMIN]: [
      { id: "users", label: "Users", icon: Users, href: "/admin/users" },
      {
        id: "courses",
        label: "Courses",
        icon: BookOpen,
        href: "/admin/courses",
      },
      {
        id: "analytics",
        label: "Analytics",
        icon: BarChart3,
        href: "/admin/analytics",
      },
    ],
    [UserRole.PARENT]: [
      // { id: "family", label: "Family", icon: Users, href: "/family" },
      {
        id: "children",
        label: "Children",
        icon: Users,
        href: "/parent/children",
      },
      {
        id: "courses",
        label: "Courses",
        icon: BookOpen,
        href: "/parent/courses",
      },
      {
        id: "billing",
        label: "Billing",
        icon: CreditCard,
        href: "/parent/billing",
      },
    ],
    [UserRole.CHILD]: [
      {
        id: "courses",
        label: "Courses",
        icon: BookOpen,
        badge: "3",
        href: "/child/courses",
      },
      {
        id: "challenges",
        label: "Challenges",
        icon: Target,
        href: "/child/challenges",
      },
      {
        id: "achievements",
        label: "Achievements",
        icon: Trophy,
        badge: "12",
        href: "/child/achievements",
      },
    ],
  };

  // Bottom items (settings is common to all)
  const bottomItems: NavigationItem[] = [
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      href: "/settings",
      roles: [UserRole.ADMIN, UserRole.PARENT, UserRole.CHILD],
    },
  ];

  // Filter navigation items based on user role
  const getFilteredItems = (items: NavigationItem[]) => {
    return items.filter((item) => !item.roles || item.roles.includes(userRole));
  };

  // Combine common items with role-specific items
  const navigationItems = [
    ...getFilteredItems(commonItems),
    ...(roleSpecificItems[userRole] || []),
  ];

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId);
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
            <Link
              href={`${item.href}`}
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex justify-center items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                activeItem === item.id
                  ? "bg-gradient-to-r from-primary-main to-primary-secondary text-white shadow-md"
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
                          : "bg-primary-secondary text-white"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        {getFilteredItems(bottomItems).map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center justify-center
                   space-x-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
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
            <span className="text-white text-sm font-medium">
              {userRole.charAt(0)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SideBar;
