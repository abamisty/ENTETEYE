import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href={"/"}>
              <div className="text-2xl font-bold text-gray-900 flex justify-center h-full items-center gap-2">
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
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a
                href="#features"
                className="text-gray-600 hover:text-primary-main transition-colors font-medium"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-gray-600 hover:text-primary-main transition-colors font-medium"
              >
                How It Works
              </a>
              <a
                href="#pricing"
                className="text-gray-600 hover:text-primary-main transition-colors font-medium"
              >
                Pricing
              </a>
              <a
                href="#about"
                className="text-gray-600 hover:text-primary-main transition-colors font-medium"
              >
                About
              </a>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link
              href={"/login"}
              className="text-gray-600 hover:text-primary-main transition-colors font-medium"
            >
              Sign In
            </Link>
            <Link
              href={"/login"}
              className="bg-primary-main text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-sm"
            >
              Get Started
            </Link>
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
            <a
              href="/#features"
              className="block px-3 py-2 text-gray-600 hover:text-primary-main hover:bg-green-50 rounded-md transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="/#how-it-works"
              className="block px-3 py-2 text-gray-600 hover:text-primary-main hover:bg-green-50 rounded-md transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </a>
            <a
              href="/#pricing"
              className="block px-3 py-2 text-gray-600 hover:text-primary-main hover:bg-green-50 rounded-md transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </a>
            <a
              href="/#about"
              className="block px-3 py-2 text-gray-600 hover:text-primary-main hover:bg-green-50 rounded-md transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </a>
            <div className="pt-2 space-y-2 border-t border-gray-200 mt-2">
              <button className="block w-full text-left px-3 py-2 text-gray-600 hover:text-primary-main hover:bg-green-50 rounded-md transition-colors">
                Sign In
              </button>
              <button className="block w-full bg-primary-main text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold">
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
