"use client";
import React, { useState } from "react";
import {
  Check,
  Star,
  Users,
  BookOpen,
  Brain,
  Trophy,
  Shield,
  Headphones,
} from "lucide-react";
import { parentApi } from "@/api/parent";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { BASE_URL } from "@/lib/constants";
import PaystackPop from "@paystack/inline-js";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/api/api";

const SubscriptionPlansPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("ikram.codes@gmail.com");
  const [name, setName] = useState("IKRAM KHAN");
  const [phone, setPhone] = useState("02434343");
  const { user } = useAuth();
  console.log(user);

  const plans = [
    {
      name: "Basic",
      product: "basic" as const,
      description:
        "Perfect for families getting started with character building",
      price: "$9.99",
      amount: 999, // Amount in USD cents (convert to NGN kobo if needed)
      period: "per month",
      originalPrice: "$19.99",
      isPopular: false,
      ctaText: "Start Trial",
      ctaStyle: "outline",
      features: [
        "Access to core courses (Ages 10-18)",
        "Basic progress tracking",
        "Child dashboard with gamification",
        "Parent oversight dashboard",
        "Basic AI course recommendations",
        "Certificate generation",
        "Up to 3 children",
        "Community access",
      ],
    },
    {
      name: "Professional",
      product: "professional" as const,
      description: "Complete family values education with advanced features",
      price: "$19.99",
      amount: 1999, // Amount in USD cents (convert to NGN kobo if needed)
      period: "per month",
      originalPrice: "$39.99",
      isPopular: true,
      ctaText: "Get Started",
      ctaStyle: "primary",
      features: [
        "Everything in Basic plan",
        "Advanced AI-powered personalization",
        "Custom course creation requests",
        "Detailed analytics & reports",
        "Family challenge mode",
        "Voice-guided AI mentor/coach",
        "Priority customer support",
        "Unlimited children",
        "Advanced parental controls",
        "Peer interaction features",
        "Export progress reports",
        "Early access to new courses",
      ],
    },
  ];

  const handleSelectPlan = async (product: "basic" | "professional") => {
    const plan = plans.find((p) => p.product === product);
    if (!plan) return;

    try {
      // Call backend to initialize transaction
      const response = await api.post(`/parent/subscription`, {
        email,
        plan: "monthly", // Adjust based on user selection
        product,
        amount: plan.amount * 100, // Convert to kobo if using NGN
        userId: user.id, // Replace with actual user ID (from auth context)
        familyId: user.familyId, // Replace with actual family ID
      });

      const { access_code, subscriptionId } = await response.data;

      if (!access_code) {
        throw new Error("Failed to get access code");
      }

      // Initialize Paystack Popup
      const paystack = new PaystackPop();
      paystack.resumeTransaction(access_code);

      // Optionally, listen for payment events (requires custom handling)
      // Paystack doesn't provide direct event listeners in Popup, so rely on callback_url or webhook
    } catch (error) {
      toast.error("Failed to initialize payment. Please try again.", {
        duration: 4000,
      });
      console.error("Error initializing payment:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Section */}
      <div className="container mx-auto px-6 pt-16 pb-8">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center bg-primary-secondary/10 rounded-full px-4 py-2 mb-6">
            <Star className="w-4 h-4 text-primary-secondary mr-2" />
            <span className="text-primary-secondary font-medium text-sm">
              Transform Your Family's Values Journey
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-primary-main mb-6 leading-tight">
            Choose Your
            <span className="bg-gradient-to-r from-primary-secondary to-blue-600 bg-clip-text text-transparent">
              {" "}
              Perfect Plan
            </span>
          </h1>

          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            Empower your children with character-building courses, life skills,
            and family values through our AI-powered learning platform designed
            for ages 10-18.
          </p>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center space-x-8 text-slate-500 mb-12">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span className="text-sm font-medium">10,000+ Families</span>
            </div>
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5" />
              <span className="text-sm font-medium">50+ Courses</span>
            </div>
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5" />
              <span className="text-sm font-medium">Award Winning</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                plan.isPopular
                  ? "bg-white shadow-2xl border-2 border-primary-secondary ring-4 ring-primary-secondary/20"
                  : "bg-white/80 backdrop-blur-sm shadow-lg border border-slate-200 hover:shadow-xl"
              }`}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-primary-secondary to-blue-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                    🔥 Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-primary-main mb-2">
                  {plan.name}
                </h3>
                <p className="text-slate-600 mb-6">{plan.description}</p>

                <div className="mb-4">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <span className="text-4xl font-bold text-primary-main">
                      {plan.price}
                    </span>
                    <span className="text-slate-500">/{plan.period}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-slate-400 line-through text-sm">
                      {plan.originalPrice}
                    </span>
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                      Save 50%
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleSelectPlan(plan.product)}
                  className={`w-full py-4 px-8 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                    plan.ctaStyle === "primary"
                      ? "bg-gradient-to-r from-primary-secondary to-blue-500 hover:from-primary-main hover:to-primary-secondary text-white shadow-lg hover:shadow-xl"
                      : "border-2 border-primary-secondary text-primary-secondary hover:bg-primary-secondary hover:text-white"
                  }`}
                >
                  {plan.ctaText}
                  {plan.isPopular && " - Free 30 Days"}
                </button>
              </div>

              {/* Features List */}
              <div className="space-y-4">
                <h4 className="font-semibold text-primary-main mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Everything Included:
                </h4>
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-start space-x-3"
                    >
                      <div
                        className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                          plan.isPopular
                            ? "bg-primary-secondary"
                            : "bg-slate-200"
                        }`}
                      >
                        <Check
                          className={`w-3 h-3 ${
                            plan.isPopular ? "text-white" : "text-slate-600"
                          }`}
                        />
                      </div>
                      <span className="text-slate-700 leading-relaxed">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Special Offer for Professional */}
              {plan.isPopular && (
                <div className="mt-6 p-4 bg-gradient-to-r from-primary-secondary/10 to-blue-100 rounded-xl border border-primary-secondary/20">
                  <div className="flex items-center space-x-2 text-primary-secondary">
                    <Brain className="w-5 h-5" />
                    <span className="font-semibold text-sm">
                      AI-Powered Learning
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">
                    Advanced AI personalization adapts to each child's learning
                    style and pace
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Additional Information */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-slate-200">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="bg-primary-secondary/10 rounded-full p-3 mb-4">
                  <Shield className="w-6 h-6 text-primary-secondary" />
                </div>
                <h4 className="font-semibold text-primary-main mb-2">
                  Safe & Secure
                </h4>
                <p className="text-slate-600 text-sm">
                  All payments are securely processed by Paystack
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="bg-primary-secondary/10 rounded-full p-3 mb-4">
                  <Headphones className="w-6 h-6 text-primary-secondary" />
                </div>
                <h4 className="font-semibold text-primary-main mb-2">
                  24/7 Support
                </h4>
                <p className="text-slate-600 text-sm">
                  Dedicated family support team ready to help you succeed
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="bg-primary-secondary/10 rounded-full p-3 mb-4">
                  <Trophy className="w-6 h-6 text-primary-secondary" />
                </div>
                <h4 className="font-semibold text-primary-main mb-2">
                  Proven Results
                </h4>
                <p className="text-slate-600 text-sm">
                  95% of families report improved family communication
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Money Back Guarantee */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center bg-green-50 border border-green-200 rounded-full px-6 py-3">
            <Check className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-800 font-medium">
              30-day money-back guarantee • Cancel anytime
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlansPage;
