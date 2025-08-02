"use client";

import React from "react";
import { Home, Users, User, LogOut, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface NavbarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export default function Navbar({ activeView, onViewChange }: NavbarProps) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="bg-blue-600 rounded-lg p-2">
              <Users className="text-white" size={24} />
            </div>
            <span className="ml-2 text-xl font-bold text-gray-900">
              Professional Network
            </span>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onViewChange("home")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                activeView === "home"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <Home size={20} />
              <span className="hidden sm:inline">Home</span>
            </button>

            <button
              onClick={() => onViewChange("network")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                activeView === "network"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <Search size={20} />
              <span className="hidden sm:inline">Network</span>
            </button>

            <button
              onClick={() => onViewChange("profile")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                activeView === "profile"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <User size={20} />
              <span className="hidden sm:inline">Profile</span>
            </button>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              <span className="font-medium">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut size={20} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
