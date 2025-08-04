"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  User,
  Mail,
  Lock,
  Users,
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AuthFormProps {
  isLogin: boolean;
  onToggle: () => void;
  onBack?: () => void;
  onSuccess?: () => void;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  bio?: string;
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
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Real-time validation
  const validation = useMemo(() => {
    const errors: ValidationErrors = {};

    if (!isLogin && formData.name && formData.name.length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = "Please enter a valid email address";
      }
    }

    if (formData.password) {
      if (formData.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
      } else if (
        !isLogin &&
        !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)
      ) {
        errors.password =
          "Password should contain uppercase, lowercase, and number";
      }
    }

    return errors;
  }, [formData, isLogin]);

  const isFormValid = useMemo(() => {
    const requiredFields = isLogin
      ? ["email", "password"]
      : ["name", "email", "password"];

    return (
      requiredFields.every((field) =>
        formData[field as keyof typeof formData].trim()
      ) && Object.keys(validation).length === 0
    );
  }, [formData, validation, isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allFields = ["name", "email", "password", "bio"];
    setTouched(Object.fromEntries(allFields.map((field) => [field, true])));

    if (!isFormValid) {
      setValidationErrors(validation);
      return;
    }

    setLoading(true);
    setError("");
    setValidationErrors({});

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

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Clear specific field error when user starts typing
      if (validationErrors[name as keyof ValidationErrors]) {
        setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    },
    [validationErrors]
  );

  const handleBlur = useCallback((fieldName: string) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
  }, []);

  const getFieldError = (fieldName: keyof ValidationErrors) => {
    return touched[fieldName] ? validation[fieldName] : undefined;
  };

  const getFieldStatus = (fieldName: keyof ValidationErrors) => {
    if (!touched[fieldName] || !formData[fieldName]) return null;
    return validation[fieldName] ? "error" : "success";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-200 to-purple-200 opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-200 to-pink-200 opacity-20 animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 opacity-30"></div>

        {/* Additional floating elements */}
        <div className="absolute top-20 left-1/4 w-4 h-4 bg-blue-400 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-6 h-6 bg-purple-400 rounded-full opacity-40 animate-bounce"></div>
      </div>

      {/* Enhanced Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-6 left-6 flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-all duration-300 z-10 bg-white/90 backdrop-blur-md px-5 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 border border-white/30"
          aria-label="Back to home"
        >
          <ArrowLeft size={20} />
          <span className="hidden sm:inline font-medium">Back to Home</span>
        </button>
      )}

      {/* Enhanced Auth Form */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10 border border-white/20">
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

        {/* Enhanced Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 animate-shake">
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium">Authentication Error</h4>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Name Field (Registration only) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
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
                  className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:outline-none transition-all duration-200 text-lg ${
                    getFieldError("name")
                      ? "border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      : getFieldStatus("name") === "success"
                      ? "border-green-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  }`}
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("name")}
                  aria-describedby={
                    getFieldError("name") ? "name-error" : undefined
                  }
                />

                {/* Status Icon */}
                {getFieldStatus("name") && (
                  <div className="absolute right-4 top-4">
                    {getFieldStatus("name") === "success" ? (
                      <CheckCircle className="text-green-500" size={20} />
                    ) : (
                      <XCircle className="text-red-500" size={20} />
                    )}
                  </div>
                )}
              </div>

              {getFieldError("name") && (
                <p
                  id="name-error"
                  className="text-red-600 text-sm mt-1 flex items-center gap-1"
                >
                  <XCircle size={14} />
                  {getFieldError("name")}
                </p>
              )}
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-gray-400" size={20} />
              <input
                type="email"
                name="email"
                required
                className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:outline-none transition-all duration-200 text-lg ${
                  getFieldError("email")
                    ? "border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    : getFieldStatus("email") === "success"
                    ? "border-green-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                }`}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={() => handleBlur("email")}
                aria-describedby={
                  getFieldError("email") ? "email-error" : undefined
                }
              />

              {getFieldStatus("email") && (
                <div className="absolute right-4 top-4">
                  {getFieldStatus("email") === "success" ? (
                    <CheckCircle className="text-green-500" size={20} />
                  ) : (
                    <XCircle className="text-red-500" size={20} />
                  )}
                </div>
              )}
            </div>

            {getFieldError("email") && (
              <p
                id="email-error"
                className="text-red-600 text-sm mt-1 flex items-center gap-1"
              >
                <XCircle size={14} />
                {getFieldError("email")}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-gray-400" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                className={`w-full pl-12 pr-16 py-3 border rounded-xl focus:outline-none transition-all duration-200 text-lg ${
                  getFieldError("password")
                    ? "border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    : getFieldStatus("password") === "success"
                    ? "border-green-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                }`}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                onBlur={() => handleBlur("password")}
                aria-describedby={
                  getFieldError("password") ? "password-error" : "password-help"
                }
              />

              {/* Password Toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {getFieldError("password") && (
              <p
                id="password-error"
                className="text-red-600 text-sm mt-1 flex items-center gap-1"
              >
                <XCircle size={14} />
                {getFieldError("password")}
              </p>
            )}

            {!isLogin && !getFieldError("password") && (
              <div id="password-help" className="mt-2">
                <p className="text-sm text-gray-500 mb-2">Password strength:</p>
                <div className="space-y-1">
                  <div
                    className={`flex items-center gap-2 text-xs ${
                      formData.password.length >= 6
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        formData.password.length >= 6
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    />
                    At least 6 characters
                  </div>
                  <div
                    className={`flex items-center gap-2 text-xs ${
                      /(?=.*[a-z])(?=.*[A-Z])/.test(formData.password)
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        /(?=.*[a-z])(?=.*[A-Z])/.test(formData.password)
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    />
                    Upper and lowercase letters
                  </div>
                  <div
                    className={`flex items-center gap-2 text-xs ${
                      /\d/.test(formData.password)
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        /\d/.test(formData.password)
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    />
                    At least one number
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bio Field (Registration only) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Professional Bio{" "}
                <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <textarea
                name="bio"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                rows={3}
                placeholder="Tell us about your professional background and expertise..."
                value={formData.bio}
                onChange={handleInputChange}
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-gray-500">
                  Help others understand your expertise
                </p>
                <span
                  className={`text-xs font-medium ${
                    formData.bio.length > 450
                      ? "text-yellow-600"
                      : "text-gray-400"
                  }`}
                >
                  {formData.bio.length}/500
                </span>
              </div>
            </div>
          )}

          {/* Enhanced Submit Button */}
          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Please wait...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <span>
                  {isLogin ? "Sign In to Your Account" : "Create Your Account"}
                </span>
                {isFormValid && <CheckCircle size={20} />}
              </div>
            )}
          </button>
        </form>

        {/* Enhanced Toggle Section */}
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
            className="mt-4 text-blue-600 hover:text-blue-800 font-semibold text-lg hover:underline transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg px-2 py-1"
          >
            {isLogin ? "Create an account" : "Sign in instead"}
          </button>
        </div>

        {/* Terms and Privacy */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 leading-relaxed">
            By continuing, you agree to our{" "}
            <button className="text-blue-600 hover:underline focus:outline-none focus:underline">
              Terms of Service
            </button>{" "}
            and{" "}
            <button className="text-blue-600 hover:underline focus:outline-none focus:underline">
              Privacy Policy
            </button>
          </p>
        </div>

        {/* Progress Indicator for Registration */}
        {!isLogin && (
          <div className="mt-6">
            <div className="flex justify-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full transition-colors ${
                  formData.name ? "bg-blue-500" : "bg-gray-300"
                }`}
              />
              <div
                className={`w-2 h-2 rounded-full transition-colors ${
                  formData.email && !getFieldError("email")
                    ? "bg-blue-500"
                    : "bg-gray-300"
                }`}
              />
              <div
                className={`w-2 h-2 rounded-full transition-colors ${
                  formData.password && !getFieldError("password")
                    ? "bg-blue-500"
                    : "bg-gray-300"
                }`}
              />
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }

        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(-3deg);
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
