"use client";

import React, { useState } from "react";
import {
  Users,
  Briefcase,
  TrendingUp,
  MessageSquare,
  Shield,
  Zap,
  ChevronRight,
  Star,
  ArrowRight,
  CheckCircle,
  Globe,
  Target,
  Award,
} from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: Users,
      title: "Professional Network",
      description:
        "Connect with industry leaders, colleagues, and potential collaborators in your field.",
      color: "bg-blue-500",
    },
    {
      icon: Briefcase,
      title: "Career Growth",
      description:
        "Share your achievements, get noticed by recruiters, and advance your career.",
      color: "bg-green-500",
    },
    {
      icon: MessageSquare,
      title: "Industry Insights",
      description:
        "Share knowledge, engage in meaningful discussions, and stay updated with industry trends.",
      color: "bg-purple-500",
    },
    {
      icon: TrendingUp,
      title: "Business Development",
      description:
        "Discover opportunities, partnerships, and grow your professional influence.",
      color: "bg-orange-500",
    },
  ];

  const stats = [
    { number: "10M+", label: "Professionals" },
    { number: "500K+", label: "Companies" },
    { number: "95%", label: "Success Rate" },
    { number: "150+", label: "Countries" },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Senior Software Engineer",
      company: "TechCorp",
      content:
        "This platform helped me connect with mentors and land my dream job. The community is incredibly supportive and knowledgeable.",
      rating: 5,
    },
    {
      name: "Marcus Johnson",
      role: "Product Manager",
      company: "Innovate.io",
      content:
        "The quality of professional discussions here is unmatched. I've gained insights that directly impacted our product strategy.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "UX Designer",
      company: "Design Studio",
      content:
        "Found my co-founder and built valuable partnerships through this network. It's essential for any professional looking to grow.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-blue-600 rounded-lg p-2">
                <Users className="text-white" size={24} />
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">
                ProfessionalNet
              </span>
            </div>
            <button
              onClick={onGetStarted}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Your Professional
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}
                Network
              </span>
              <br />
              Starts Here
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Connect with industry professionals, share insights, and
              accelerate your career growth in a platform built for ambitious
              professionals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={onGetStarted}
                className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all duration-300 font-semibold text-lg flex items-center gap-2 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Join Now - It's Free
                <ArrowRight size={20} />
              </button>
              <button className="text-gray-600 hover:text-gray-900 px-8 py-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 font-semibold text-lg">
                Watch Demo
              </button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 bg-white rounded-2xl shadow-lg p-4 transform rotate-3 animate-float">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 rounded-full p-2">
              <CheckCircle className="text-green-600" size={16} />
            </div>
            <span className="text-sm font-medium">Career Growth</span>
          </div>
        </div>

        <div className="absolute top-32 right-10 bg-white rounded-2xl shadow-lg p-4 transform -rotate-2 animate-float-delayed">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-full p-2">
              <Users className="text-blue-600" size={16} />
            </div>
            <span className="text-sm font-medium">10M+ Professionals</span>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-400 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need to
              <span className="text-blue-600"> Succeed</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform provides all the tools and connections you need to
              take your professional journey to the next level.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all duration-300 cursor-pointer transform hover:-translate-y-2 hover:shadow-xl"
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div
                  className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-4 flex items-center text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Learn more
                  <ChevronRight size={16} className="ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Trusted by
              <span className="text-blue-600"> Professionals</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of professionals who have accelerated their careers
              through our platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="text-yellow-400 fill-current"
                      size={20}
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-full p-3 mr-4">
                    <Users className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Accelerate Your Career?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Join millions of professionals who are already networking, learning,
            and growing their careers on our platform.
          </p>
          <button
            onClick={onGetStarted}
            className="bg-white text-blue-600 px-8 py-4 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold text-lg transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
          >
            Start Your Journey Today
            <Zap size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-blue-600 rounded-lg p-2">
                <Users className="text-white" size={24} />
              </div>
              <span className="ml-2 text-xl font-bold">ProfessionalNet</span>
            </div>
            <div className="text-gray-400">
              © 2024 ProfessionalNet. Built for ambitious professionals.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
