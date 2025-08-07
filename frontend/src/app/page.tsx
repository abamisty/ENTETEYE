"use client";
import React, { useState } from "react";
import {
  Star,
  Users,
  BookOpen,
  Award,
  Target,
  ArrowRight,
  CheckCircle,
  Menu,
  X,
  Play,
  Heart,
  Shield,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 via-white to-emerald-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <div className="mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-main/10 text-primary-main border border-primary-main/20">
                  <Zap size={16} className="mr-1" />
                  AI-Powered Learning Platform
                </span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Build Character,
                <span className="block text-primary-main">Shape Values,</span>
                <span className="block">Empower Futures</span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                A gamified e-learning platform where parents guide their
                children (ages 10-18) through personalized journeys of character
                development, life skills mastery, and family values education.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  href={"/login"}
                  className="bg-primary-main text-white px-8 py-4 rounded-xl hover:bg-green-700 transition-all duration-300 flex items-center justify-center group shadow-lg"
                >
                  Start Your Family Journey
                  <ArrowRight
                    size={20}
                    className="ml-2 group-hover:translate-x-1 transition-transform"
                  />
                </Link>
                <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center">
                  <Play size={20} className="mr-2" />
                  Watch Demo
                </button>
              </div>

              <div className="flex items-center space-x-8 text-sm text-gray-500">
                <div className="flex items-center">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 bg-primary-main rounded-full border-2 border-white"
                      ></div>
                    ))}
                  </div>
                  <span className="ml-3">Trusted by 2,500+ families</span>
                </div>
                <div className="flex items-center">
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <span className="ml-2">4.9/5 rating</span>
                </div>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Current Course Progress
                    </h3>
                    <div className="bg-gray-100 rounded-full h-3 mb-2">
                      <div
                        className="bg-primary-main rounded-full h-3"
                        style={{ width: "75%" }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">
                      The Heart Compass: Love & Affection - 75% Complete
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                      <div className="flex items-center">
                        <CheckCircle
                          size={20}
                          className="text-primary-main mr-3"
                        />
                        <span className="text-sm font-medium">
                          Self-Love & Care Module
                        </span>
                      </div>
                      <Award size={16} className="text-yellow-500" />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center">
                        <div className="w-5 h-5 border-2 border-blue-400 rounded-full mr-3 flex items-center justify-center">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        </div>
                        <span className="text-sm font-medium">
                          Family Bonds & Communication
                        </span>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                        In Progress
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center">
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full mr-3"></div>
                        <span className="text-sm font-medium text-gray-500">
                          Empathy & Community Care
                        </span>
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                        Locked
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Heart Gems Earned
                      </span>
                      <span className="font-bold text-primary-main">
                        1,247 ⭐
                      </span>
                    </div>
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 bg-yellow-400 text-white p-3 rounded-full shadow-lg">
                  <Award size={24} />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-red-400 text-white p-3 rounded-full shadow-lg">
                  <Heart size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything Your Family Needs to Grow Together
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From AI-powered personalization to gamified learning experiences,
              ENTETEYE provides the tools for meaningful character development.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-100">
              <div className="w-12 h-12 bg-primary-main rounded-xl flex items-center justify-center mb-6">
                <Users className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Parent Dashboard
              </h3>
              <p className="text-gray-600 mb-4">
                Track your child's progress, customize learning paths, and
                request AI-generated courses tailored to your family values.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle size={16} className="text-primary-main mr-2" />
                  Progress tracking & analytics
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle size={16} className="text-primary-main mr-2" />
                  Custom course requests
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle size={16} className="text-primary-main mr-2" />
                  Multi-child management
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-2xl border border-blue-100">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-6">
                <BookOpen className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Gamified Learning
              </h3>
              <p className="text-gray-600 mb-4">
                Interactive storytelling, role-play simulations, and badge
                systems keep children engaged and motivated to learn.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle size={16} className="text-blue-500 mr-2" />
                  Avatar customization
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle size={16} className="text-blue-500 mr-2" />
                  Achievement badges
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle size={16} className="text-blue-500 mr-2" />
                  Interactive simulations
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl border border-purple-100">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-6">
                <Zap className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                AI-Powered Personalization
              </h3>
              <p className="text-gray-600 mb-4">
                Advanced AI adapts content difficulty, suggests personalized
                challenges, and provides intelligent feedback.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle size={16} className="text-purple-500 mr-2" />
                  Adaptive learning paths
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle size={16} className="text-purple-500 mr-2" />
                  Smart course generation
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle size={16} className="text-purple-500 mr-2" />
                  Personalized challenges
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-8 rounded-2xl border border-yellow-100">
              <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center mb-6">
                <Target className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Age-Appropriate Content
              </h3>
              <p className="text-gray-600 mb-4">
                Carefully crafted curriculum for three developmental stages:
                10-12, 13-15, and 16-18 year-olds.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle size={16} className="text-yellow-500 mr-2" />
                  Developmental psychology-based
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle size={16} className="text-yellow-500 mr-2" />
                  Scaffolded complexity
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle size={16} className="text-yellow-500 mr-2" />
                  Safe learning environment
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-pink-50 p-8 rounded-2xl border border-red-100">
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mb-6">
                <Heart className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Character & Values
              </h3>
              <p className="text-gray-600 mb-4">
                Comprehensive courses on integrity, empathy, responsibility, and
                other essential character traits.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle size={16} className="text-red-500 mr-2" />
                  13+ family values courses
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle size={16} className="text-red-500 mr-2" />
                  11+ character traits
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle size={16} className="text-red-500 mr-2" />
                  Real-world applications
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-green-50 p-8 rounded-2xl border border-teal-100">
              <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center mb-6">
                <Shield className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Essential Life Skills
              </h3>
              <p className="text-gray-600 mb-4">
                From financial literacy to communication skills, prepare your
                child for independent living.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle size={16} className="text-teal-500 mr-2" />
                  Financial literacy
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle size={16} className="text-teal-500 mr-2" />
                  Communication skills
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle size={16} className="text-teal-500 mr-2" />
                  Decision making
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple Steps to Transform Learning
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in minutes with our intuitive platform designed for
              busy families.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-main rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Create Family Profile
              </h3>
              <p className="text-gray-600">
                Sign up and add your children's profiles. Tell us about your
                family values and learning goals.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Choose or Create Courses
              </h3>
              <p className="text-gray-600">
                Browse our catalog or request AI-generated courses tailored to
                your specific values and goals.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Watch Them Grow
              </h3>
              <p className="text-gray-600">
                Monitor progress, celebrate achievements, and watch your
                children develop into confident, value-driven individuals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-main to-primary-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Your Family's Growth Journey?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join thousands of families who are already building character,
            developing life skills, and strengthening their bonds through
            ENTETEYE.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-primary-main px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors font-semibold shadow-lg">
              Start Free Trial
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-xl hover:bg-white hover:text-primary-main transition-colors font-semibold">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold mb-4">
                <span className="text-primary-main relative top-1">
                  ENTETEYE
                </span>
              </div>
              <p className="text-gray-400 mb-4">
                Empowering families to build character, develop life skills, and
                strengthen values together.
              </p>
              <div className="flex space-x-4">
                {/* Social media icons would go here */}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Parent Dashboard
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Child Experience
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    AI Course Generator
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Progress Tracking
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Courses</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Character Values
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Life Skills
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Financial Literacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Communication
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 mt-8 text-center text-gray-400">
            <p>&copy; 2025 ENTETEYE. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
