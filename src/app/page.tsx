"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import LandingPage from "@/components/landing/LandingPage";
import AuthForm from "@/components/auth/AuthForm";
import Navbar from "@/components/layout/Navbar";
import HomeFeed from "@/components/feed/HomeFeed";
import ProfileView from "@/components/profile/ProfileView";
import NetworkView from "@/components/network/NetworkView";

export default function Home() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<"landing" | "auth" | "app">(
    "landing"
  );
  const [isLogin, setIsLogin] = useState(true);
  const [activeView, setActiveView] = useState("home");
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    null
  );

  // ✅ ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // Auto-navigate to app if user is authenticated
  React.useEffect(() => {
    if (user && currentPage !== "app") {
      setCurrentPage("app");
    }
  }, [user, currentPage]);

  // Navigation handlers
  const handleGetStarted = () => {
    setCurrentPage("auth");
    setIsLogin(false); // Default to register for new users
  };

  const handleBackToLanding = () => {
    setCurrentPage("landing");
    setIsLogin(true);
  };

  const handleAuthSuccess = () => {
    setCurrentPage("app");
    setActiveView("home");
  };

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

  // ✅ CONDITIONAL RENDERING HAPPENS AFTER ALL HOOKS
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-24 mx-auto animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Landing Page
  if (currentPage === "landing") {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  // Authentication Page
  if (currentPage === "auth") {
    return (
      <AuthForm
        isLogin={isLogin}
        onToggle={() => setIsLogin(!isLogin)}
        onBack={handleBackToLanding}
        onSuccess={handleAuthSuccess}
      />
    );
  }

  // Main Application (only accessible when authenticated)
  if (!user) {
    // Fallback - should not happen due to useEffect above
    // Note: Don't call setCurrentPage here as it would cause an infinite loop
    // Instead, redirect declaratively
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        activeView={activeView}
        onViewChange={handleViewChange}
        onBackToLanding={handleBackToLanding}
      />

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
