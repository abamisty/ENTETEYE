"use client";
import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleAnchorLink = (hash: string) => {
    setIsMenuOpen(false);

    // If we're already on the home page, scroll to the section
    if (pathname === "/") {
      const element = document.getElementById(hash.replace("#", ""));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // If we're on another page, navigate to home page with hash
      router.push(`/${hash}`);
    }
  };

  const handleRegularLink = (path: string) => {
    setIsMenuOpen(false);
    router.push(path);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-2xl font-bold text-gray-900 flex justify-center h-full items-center gap-2"
            >
              <img
                alt="logo"
                width={50}
                height={50}
                src="/logo.jpg"
                className="rounded-lg"
              />
              <span className="text-primary-main relative top-1">
                ENTETEYE ACADEMY
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <button
                onClick={() => handleAnchorLink("#features")}
                className="text-gray-600 hover:text-primary-main transition-colors font-medium"
              >
                Features
              </button>
              <button
                onClick={() => handleAnchorLink("#how-it-works")}
                className="text-gray-600 hover:text-primary-main transition-colors font-medium"
              >
                How It Works
              </button>
              <button
                onClick={() => handleAnchorLink("#pricing")}
                className="text-gray-600 hover:text-primary-main transition-colors font-medium"
              >
                Pricing
              </button>
              <button
                onClick={() => handleAnchorLink("#about")}
                className="text-gray-600 hover:text-primary-main transition-colors font-medium"
              >
                About
              </button>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => handleRegularLink("/login")}
              className="text-gray-600 hover:text-primary-main transition-colors font-medium"
            >
              Sign In
            </button>
            <button
              onClick={() => handleRegularLink("/login")}
              className="bg-primary-main text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-sm"
            >
              Get Started
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-primary-main transition-colors p-2"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <button
              onClick={() => handleAnchorLink("#features")}
              className="block w-full text-left px-3 py-2 text-gray-600 hover:text-primary-main hover:bg-green-50 rounded-md transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => handleAnchorLink("#how-it-works")}
              className="block w-full text-left px-3 py-2 text-gray-600 hover:text-primary-main hover:bg-green-50 rounded-md transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => handleAnchorLink("#pricing")}
              className="block w-full text-left px-3 py-2 text-gray-600 hover:text-primary-main hover:bg-green-50 rounded-md transition-colors"
            >
              Pricing
            </button>
            <button
              onClick={() => handleAnchorLink("#about")}
              className="block w-full text-left px-3 py-2 text-gray-600 hover:text-primary-main hover:bg-green-50 rounded-md transition-colors"
            >
              About
            </button>
            <div className="pt-2 space-y-2 border-t border-gray-200 mt-2">
              <button
                onClick={() => handleRegularLink("/login")}
                className="block w-full text-left px-3 py-2 text-gray-600 hover:text-primary-main hover:bg-green-50 rounded-md transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => handleRegularLink("/login")}
                className="block w-full bg-primary-main text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold text-center"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
