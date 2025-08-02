"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AuthForm from "@/components/auth/AuthForm";
import Navbar from "@/components/layout/Navbar";
import HomeFeed from "@/components/feed/HomeFeed";
import ProfileView from "@/components/profile/ProfileView";
import NetworkView from "@/components/network/NetworkView";

export default function Home() {
  const { user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [activeView, setActiveView] = useState("home");
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    null
  );

  const handleViewChange = (view: string) => {
    setActiveView(view);
    setSelectedProfileId(null);
  };

  const handleProfileView = (userId: string) => {
    setSelectedProfileId(userId);
    setActiveView("profile");
  };

  const handleBackToFeed = () => {
    setSelectedProfileId(null);
    setActiveView("home");
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Authentication required
  if (!user) {
    return <AuthForm isLogin={isLogin} onToggle={() => setIsLogin(!isLogin)} />;
  }

  // Main application
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeView={activeView} onViewChange={handleViewChange} />

      <main className="py-6">
        {activeView === "home" && (
          <HomeFeed onProfileView={handleProfileView} />
        )}

        {activeView === "profile" && (
          <ProfileView
            userId={selectedProfileId || undefined}
            onBack={selectedProfileId ? handleBackToFeed : undefined}
            onProfileView={handleProfileView}
          />
        )}

        {activeView === "network" && (
          <NetworkView onProfileView={handleProfileView} />
        )}
      </main>
    </div>
  );
}
