"use client";

import React, { useState } from "react";
import {
  Home,
  Users,
  User,
  LogOut,
  Search,
  Bell,
  Menu,
  X,
  ChevronDown,
  Settings,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface NavbarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onBackToLanding?: () => void;
}

export default function Navbar({
  activeView,
  onViewChange,
  onBackToLanding,
}: NavbarProps) {
  const { user, logout } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    onBackToLanding?.();
  };

  const navigationItems = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      description: "Your feed and updates",
    },
    {
      id: "network",
      label: "Network",
      icon: Search,
      description: "Discover professionals",
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
      description: "Your professional profile",
    },
  ];

  return (
    <nav className="shadow-lg border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-2 shadow-lg">
                <Users className="text-white" size={24} />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">
                  Professional Network
                </h1>
                <p className="text-xs text-gray-500 -mt-1">
                  Connect. Share. Grow.
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`group flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-blue-100 text-blue-700 shadow-md"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                  title={item.description}
                >
                  <Icon
                    size={20}
                    className={`${
                      isActive
                        ? "text-blue-600"
                        : "group-hover:scale-110 transition-transform"
                    }`}
                  />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="bg-blue-100 rounded-full p-2">
                  <User className="text-blue-600" size={18} />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-gray-900 truncate max-w-32">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate max-w-32">
                    {user?.email}
                  </p>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform ${
                    showUserMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      onViewChange("profile");
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                  >
                    <User size={16} />
                    <span>View Profile</span>
                  </button>

                  <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center space-x-3">
                    <Settings size={16} />
                    <span>Settings</span>
                  </button>

                  <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center space-x-3">
                    <HelpCircle size={16} />
                    <span>Help & Support</span>
                  </button>

                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center space-x-3"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
            >
              {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="py-4 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onViewChange(item.id);
                      setShowMobileMenu(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <Icon size={20} />
                    <div className="text-left">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-gray-500">
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}

              <div className="border-t border-gray-200 mt-4 pt-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut size={20} />
                  <div className="text-left">
                    <p className="font-medium">Sign Out</p>
                    <p className="text-sm text-red-500">Leave the platform</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close menus */}
      {(showUserMenu || showMobileMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserMenu(false);
            setShowMobileMenu(false);
          }}
        />
      )}
    </nav>
  );
}
