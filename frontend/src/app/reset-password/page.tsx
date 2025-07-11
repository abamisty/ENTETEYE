"use client";
import React, { useState } from "react";
import { Lock, Eye, EyeOff, Check, ArrowLeft, BookOpen } from "lucide-react";
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

const ResetPasswordPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validationSchema = Yup.object({
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .matches(/[a-z]/, "Must contain at least one lowercase letter")
      .matches(/[A-Z]/, "Must contain at least one uppercase letter")
      .matches(/[0-9]/, "Must contain at least one number")
      .matches(/[^a-zA-Z0-9]/, "Must contain at least one special character")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Please confirm your password"),
  });

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: (values) => {
      console.log("Password reset submitted:", values);
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

      <div className="relative z-10 w-full max-w-7xl mx-auto gap-8 items-center">
        {/* Reset password form */}
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
                {isSubmitted ? "Password Updated!" : "Reset Your Password"}
              </CardTitle>
              <CardDescription className="text-base text-slate-600">
                {isSubmitted
                  ? "Your password has been successfully updated"
                  : "Create a new password for your account"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {!isSubmitted ? (
                <form onSubmit={formik.handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-700">
                      New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your new password"
                        className="pl-10 pr-10 h-12 text-base border-slate-200 focus:border-primary-secondary focus:ring-primary-secondary"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {formik.errors.password && formik.touched.password && (
                      <p className="text-sm text-red-500 mt-1">
                        {formik.errors.password}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-slate-700">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your new password"
                        className="pl-10 pr-10 h-12 text-base border-slate-200 focus:border-primary-secondary focus:ring-primary-secondary"
                        value={formik.values.confirmPassword}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {formik.errors.confirmPassword &&
                      formik.touched.confirmPassword && (
                        <p className="text-sm text-red-500 mt-1">
                          {formik.errors.confirmPassword}
                        </p>
                      )}
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-slate-600">
                      <p className="font-medium">Password requirements:</p>
                      <ul className="list-disc list-inside space-y-1 mt-1">
                        <li
                          className={`flex items-center ${
                            formik.values.password.length >= 8
                              ? "text-green-500"
                              : "text-slate-500"
                          }`}
                        >
                          {formik.values.password.length >= 8 ? (
                            <Check className="w-3 h-3 mr-1" />
                          ) : (
                            "•"
                          )}{" "}
                          At least 8 characters
                        </li>
                        <li
                          className={`flex items-center ${
                            /[a-z]/.test(formik.values.password)
                              ? "text-green-500"
                              : "text-slate-500"
                          }`}
                        >
                          {/[a-z]/.test(formik.values.password) ? (
                            <Check className="w-3 h-3 mr-1" />
                          ) : (
                            "•"
                          )}{" "}
                          One lowercase letter
                        </li>
                        <li
                          className={`flex items-center ${
                            /[A-Z]/.test(formik.values.password)
                              ? "text-green-500"
                              : "text-slate-500"
                          }`}
                        >
                          {/[A-Z]/.test(formik.values.password) ? (
                            <Check className="w-3 h-3 mr-1" />
                          ) : (
                            "•"
                          )}{" "}
                          One uppercase letter
                        </li>
                        <li
                          className={`flex items-center ${
                            /[0-9]/.test(formik.values.password)
                              ? "text-green-500"
                              : "text-slate-500"
                          }`}
                        >
                          {/[0-9]/.test(formik.values.password) ? (
                            <Check className="w-3 h-3 mr-1" />
                          ) : (
                            "•"
                          )}{" "}
                          One number
                        </li>
                        <li
                          className={`flex items-center ${
                            /[^a-zA-Z0-9]/.test(formik.values.password)
                              ? "text-green-500"
                              : "text-slate-500"
                          }`}
                        >
                          {/[^a-zA-Z0-9]/.test(formik.values.password) ? (
                            <Check className="w-3 h-3 mr-1" />
                          ) : (
                            "•"
                          )}{" "}
                          One special character
                        </li>
                      </ul>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold bg-primary-secondary text-white hover:from-[#032d5a] hover:to-[#3a7bd5] transform hover:scale-[1.02] transition-all duration-200 shadow-lg mt-4"
                    disabled={formik.isSubmitting || !formik.isValid}
                  >
                    {formik.isSubmitting ? "Updating..." : "Reset Password"}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-slate-700 mb-6">
                    Your password has been successfully updated. You can now
                    sign in with your new password.
                  </p>
                  <Button
                    className="w-full h-12 text-base font-semibold bg-primary-secondary text-white hover:from-[#032d5a] hover:to-[#3a7bd5] transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
                    onClick={() => (window.location.href = "/login")}
                  >
                    Continue to Login
                  </Button>
                </div>
              )}

              {!isSubmitted && (
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
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
