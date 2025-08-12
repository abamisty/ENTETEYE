"use client";
import React, { useEffect, useState, useRef } from "react";
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
  Volume2,
  VolumeX,
  Volume1,
  Music,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import {
  toggleMute,
  setVolume,
  toggleMusic,
  setIsPlaying,
} from "@/store/slices/musicSlice";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/auth";
import Image from "next/image";
import Link from "next/link";

const Header: React.FC = () => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMusicControls, setShowMusicControls] = useState(false);

  const { user } = useAuth();
  const dispatch = useDispatch();
  const {
    isEnabled: musicEnabled,
    isMuted,
    volume,
    isPlaying,
  } = useSelector((state: RootState) => state.music);

  // Audio ref for background music
  const audioRef = useRef<HTMLAudioElement>(null);

  const [home, setHome] = useState("/parent/dashboard");

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

  // Set home route based on user role
  useEffect(() => {
    if (user?.role === UserRole.PARENT) {
      setHome("/parent/dashboard");
    } else if (user?.role === UserRole.CHILD) {
      setHome("/child/dashboard");
      setTimeout(() => {
        playBackgroundMusic();
      }, 1000);
    } else {
      setHome("/admin/dashboard");
    }
  }, [user?.role]);

  // Update audio element when volume or mute state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Background music control functions
  const playBackgroundMusic = async () => {
    if (audioRef.current && musicEnabled) {
      try {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
        dispatch(setIsPlaying(true));
      } catch (error) {
        console.error("Error playing background music:", error);
        dispatch(setIsPlaying(false));
      }
    }
  };

  const stopBackgroundMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      dispatch(setIsPlaying(false));
    }
  };

  // Music control functions
  const handleMusicToggle = () => {
    dispatch(toggleMusic());
    if (!musicEnabled) {
      // If turning on, start music
      setTimeout(() => playBackgroundMusic(), 100);
    } else {
      stopBackgroundMusic();
    }
  };

  const handleMuteToggle = () => {
    dispatch(toggleMute());
  };

  const handleVolumeChange = (newVolume: number) => {
    dispatch(setVolume(newVolume));
  };

  // Manual play button
  const handlePlayMusic = () => {
    playBackgroundMusic();
  };

  // Manual stop button
  const handleStopMusic = () => {
    stopBackgroundMusic();
  };

  // Get appropriate volume icon
  const getVolumeIcon = () => {
    if (!musicEnabled || isMuted || volume === 0) {
      return <VolumeX className="w-5 h-5" />;
    } else if (volume < 0.5) {
      return <Volume1 className="w-5 h-5" />;
    } else {
      return <Volume2 className="w-5 h-5" />;
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 relative z-30">
      {/* Background Music Audio Element - Only for Child Users */}
      {user?.role === UserRole.CHILD && (
        <audio
          ref={audioRef}
          loop
          preload="auto"
          onError={(e) => console.error("Audio error:", e)}
          onCanPlay={() => console.log("Audio ready to play")}
          onPlay={() => dispatch(setIsPlaying(true))}
          onPause={() => dispatch(setIsPlaying(false))}
          onEnded={() => dispatch(setIsPlaying(false))}
        >
          <source src="/background.mp3" type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      )}

      {/* Mobile menu button */}
      <button
        className="sm:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
        onClick={() => setShowMobileMenu(!showMobileMenu)}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Logo and search */}
      <div className="flex items-center space-x-4 flex-1">
        <Link href={home}>
          <div className="flex items-center h-full space-x-3 mr-[3rem]">
            <div className="w-max h-max rounded-lg flex items-center justify-center">
              <Image src={"/logo.jpg"} alt="Enteteye" width={60} height={60} />
            </div>
            <div className="hidden justify-center items-center h-full sm:flex">
              <h1 className="text-lg h-full font-bold relative top-[6px] text-primary-main">
                ENTETEYE
              </h1>
            </div>
          </div>
        </Link>
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
        {/* Music Controls - Only for Child Users */}
        {user?.role === UserRole.CHILD && (
          <div className="relative">
            <button
              onClick={() => setShowMusicControls(!showMusicControls)}
              className={`relative p-2 rounded-lg transition-all duration-200 ${
                musicEnabled && isPlaying
                  ? "bg-gradient-to-r from-purple-100 to-blue-100 text-purple-600 hover:from-purple-200 hover:to-blue-200"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
              title={
                musicEnabled
                  ? isMuted
                    ? "Unmute Music"
                    : "Mute Music"
                  : "Enable Music"
              }
            >
              {getVolumeIcon()}
              {musicEnabled && isPlaying && !isMuted && (
                <div className="absolute -top-1 -right-1 w-3 h-3">
                  <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
                </div>
              )}
            </button>

            {/* Music Controls Dropdown */}
            {showMusicControls && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Music className="w-4 h-4 text-purple-500" />
                    Background Music
                  </h3>
                  <button
                    onClick={handleMusicToggle}
                    className={`w-12 h-6 rounded-full transition-all duration-200 ${
                      musicEnabled ? "bg-purple-500" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${
                        musicEnabled ? "translate-x-6" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                {musicEnabled && (
                  <>
                    {/* Play/Stop Controls */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handlePlayMusic}
                          disabled={!musicEnabled || isPlaying}
                          className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                        >
                          ▶️ Play Music
                        </button>
                        <button
                          onClick={handleStopMusic}
                          disabled={!musicEnabled || !isPlaying}
                          className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                        >
                          ⏸️ Stop Music
                        </button>
                      </div>
                    </div>

                    {/* Volume Control */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Volume</span>
                        <span className="text-sm font-medium text-gray-800">
                          {Math.round(volume * 100)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleMuteToggle}
                          className="p-1 rounded hover:bg-gray-100"
                        >
                          {isMuted ? (
                            <VolumeX className="w-4 h-4 text-gray-500" />
                          ) : (
                            <Volume2 className="w-4 h-4 text-purple-500" />
                          )}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={isMuted ? 0 : volume}
                          onChange={(e) => {
                            const newVolume = parseFloat(e.target.value);
                            handleVolumeChange(newVolume);
                            if (newVolume > 0 && isMuted) {
                              dispatch(toggleMute());
                            }
                          }}
                          className="flex-1 accent-purple-500"
                        />
                      </div>
                    </div>

                    {/* Music Status */}
                    <div className="text-xs text-gray-500 flex items-center justify-between">
                      <span>Status:</span>
                      <span
                        className={`font-medium ${
                          isPlaying ? "text-green-600" : "text-gray-600"
                        }`}
                      >
                        {isPlaying ? "🎵 Playing" : "⏸️ Paused"}
                      </span>
                    </div>
                  </>
                )}

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">
                    Background music helps you stay focused while learning! 🎯
                  </p>

                  {/* Debug Info */}
                  <div className="text-xs text-gray-400 space-y-1">
                    <p>Audio Ready: {audioRef.current ? "✅" : "❌"}</p>
                    <p>File: /background.mp3</p>
                    <p>Status: {isPlaying ? "Playing 🎵" : "Stopped ⏸️"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

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
            <div className="w-8 h-8 bg-gradient-to-r from-primary-main to-primary-secondary rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-sm font-medium text-gray-700">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500">
                {`${user?.role?.[0]?.toUpperCase()}${user?.role?.slice(1)}`}{" "}
                Account
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
                  {user?.role === UserRole.ADMIN ||
                  user?.role === UserRole.PARENT
                    ? user?.email
                    : user?.username}
                </p>
                <p className="text-xs text-primary-main mt-1">Premium Plan</p>
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
            <div className="w-8 h-8 bg-gradient-to-r from-primary-main to-primary-secondary rounded-full flex items-center justify-center">
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
                  {user?.role === UserRole.ADMIN ||
                  user?.role === UserRole.PARENT
                    ? user?.email
                    : user?.username}
                </p>
                <p className="text-xs text-primary-secondary mt-1">
                  Premium Plan
                </p>
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
      {(showProfileDropdown ||
        showNotifications ||
        showMobileMenu ||
        showMusicControls) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowProfileDropdown(false);
            setShowNotifications(false);
            setShowMobileMenu(false);
            setShowMusicControls(false);
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
