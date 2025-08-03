"use client";

import React, { useState } from "react";
import {
  User,
  Mail,
  Lock,
  Users,
  AlertCircle,
  ArrowLeft,
  Home,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AuthFormProps {
  isLogin: boolean;
  onToggle: () => void;
  onBack?: () => void;
  onSuccess?: () => void;
}

export default function AuthForm({
  isLogin,
  onToggle,
  onBack,
  onSuccess,
}: AuthFormProps) {
  const { login, register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    bio: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(
          formData.name,
          formData.email,
          formData.password,
          formData.bio
        );
      }
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-200 to-purple-200 opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-200 to-pink-200 opacity-20 animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 opacity-30"></div>
      </div>

      {/* Back to Landing Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-6 left-6 flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors z-10 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg hover:shadow-xl"
        >
          <ArrowLeft size={20} />
          <span className="hidden sm:inline">Back to Home</span>
        </button>
      )}

      {/* Auth Form */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md relative z-10 border border-white/20">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Users className="text-white" size={36} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {isLogin ? "Welcome Back" : "Join the Network"}
          </h1>
          <p className="text-gray-600 text-lg">
            {isLogin
              ? "Sign in to continue your professional journey"
              : "Create your professional profile today"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700">
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium">Authentication Error</h4>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User
                  className="absolute left-4 top-4 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  name="name"
                  required={!isLogin}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-gray-400" size={20} />
              <input
                type="email"
                name="email"
                required
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-gray-400" size={20} />
              <input
                type="password"
                name="password"
                required
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
            {!isLogin && (
              <p className="text-sm text-gray-500 mt-2">
                Must be at least 6 characters long
              </p>
            )}
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Professional Bio{" "}
                <span className="text-gray-400">(Optional)</span>
              </label>
              <textarea
                name="bio"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                rows={3}
                placeholder="Tell us about your professional background..."
                value={formData.bio}
                onChange={handleInputChange}
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-gray-500">
                  Help others understand your expertise
                </p>
                <span className="text-xs text-gray-400">
                  {formData.bio.length}/500
                </span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Please wait...</span>
              </div>
            ) : (
              <>{isLogin ? "Sign In to Your Account" : "Create Your Account"}</>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                {isLogin ? "New to the platform?" : "Already have an account?"}
              </span>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="mt-4 text-blue-600 hover:text-blue-800 font-semibold text-lg hover:underline transition-colors"
          >
            {isLogin ? "Create an account" : "Sign in instead"}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
