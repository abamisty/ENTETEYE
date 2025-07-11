"use client";
import React, { useState } from "react";
import { Mail, ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useFormik } from "formik";
import * as Yup from "yup";

const ForgotPasswordPage: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema,
    onSubmit: (values) => {
      console.log("Reset request submitted:", values);
      // Add your password reset logic here
      setIsSubmitted(true);
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center w-screen p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-pink-400/20 to-yellow-400/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-indigo-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto  gap-8 items-center">
        {/* Right side - Password reset form */}
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md shadow-2xl border-0 backdrop-blur-sm bg-white/90">
            <CardHeader className="space-y-1 text-center pb-8">
              {/* Mobile logo */}
              <div className="lg:hidden mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-main to-primary-secondary rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
                  <BookOpen className="w-10 h-10 text-white" />
                </div>
              </div>

              <CardTitle className="text-3xl font-bold text-slate-900">
                {isSubmitted ? "Check your email" : "Forgot your password?"}
              </CardTitle>
              <CardDescription className="text-base text-slate-600">
                {isSubmitted
                  ? "We've sent a password reset link to your email"
                  : "No worries, Enter your email to receive a reset link"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {!isSubmitted ? (
                <form onSubmit={formik.handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10 h-12 text-base border-slate-200 focus:border-primary-secondary focus:ring-primary-secondary"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                    </div>
                    {formik.errors.email && formik.touched.email && (
                      <p className="text-sm text-red-500 mt-1">
                        {formik.errors.email}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold bg-primary-secondary text-white hover:from-[#032d5a] hover:to-[#3a7bd5] transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
                    disabled={formik.isSubmitting}
                  >
                    {formik.isSubmitting ? "Sending..." : "Send reset link"}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-slate-700 mb-6">
                    If an account exists for{" "}
                    <span className="font-medium">{formik.values.email}</span>,
                    you'll receive instructions to reset your password.
                  </p>
                </div>
              )}

              <div className="text-center mt-4">
                <Button
                  variant="link"
                  className="text-primary-secondary hover:text-primary-main font-medium"
                  onClick={() => window.history.back()}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
