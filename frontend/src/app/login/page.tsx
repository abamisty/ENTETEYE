"use client";
import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  BookOpen,
  Heart,
  Star,
  Shield,
} from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types/auth";
import toast from "react-hot-toast";
import { api, handleApiError } from "@/api/api";
import { ResponseInterface } from "@/types/interfaces";
import axios from "axios";
import { BASE_URL, errorStyles, successStyles } from "@/lib/constants";
import { error } from "console";

interface FormValues {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
  role: UserRole;
}

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const router = useRouter();

  const login = async (credentials: {
    email: string;
    password: string;
    role: UserRole;
  }) => {
    try {
      const response: ResponseInterface = await axios.post(
        `${BASE_URL}/auth/login`,
        credentials,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      handleApiError(error, "Login failed");
    }
  };

  const register = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
  }) => {
    try {
      const response: ResponseInterface = await axios.post(
        `${BASE_URL}/auth/register`,
        userData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error: any) {
      handleApiError(error);
    }
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    ...(isLogin
      ? {}
      : {
          name: Yup.string().required("Full name is required"),
          confirmPassword: Yup.string()
            .oneOf([Yup.ref("password")], "Passwords must match")
            .required("Please confirm your password"),
          role: Yup.string()
            .oneOf(Object.values(UserRole))
            .required("Role is required"),
        }),
  });

  const formik = useFormik<FormValues>({
    initialValues: {
      email: "",
      password: "",
      name: "",
      confirmPassword: "",
      role: UserRole.PARENT,
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        if (isLogin) {
          // Handle login
          const response = await login({
            email: values.email,
            password: values.password,
            role: values.role,
          });

          if (response.success) {
            toast.success(response.message, successStyles);
            switch (values.role) {
              case UserRole.ADMIN:
                router.push("/admin/dashboard");
                break;
              case UserRole.PARENT:
                router.push("/parent/dashboard");
                break;
              case UserRole.CHILD:
                router.push("/child/dashboard");
                break;
              default:
                router.push("/dashboard");
            }
          }
        } else {
          // Handle registration
          const [firstName, ...lastNameParts] = values.name.split(" ");
          const lastName = lastNameParts.join(" ");
          if (!lastName) {
            toast.error("Last Name is required!", errorStyles);
          }
          const response = await register({
            firstName,
            lastName,
            email: values.email,
            password: values.password,
            role: values.role,
          });

          if (response.success) {
            toast.success(response.message, successStyles);
            setIsLogin(true);
          }
        }
      } catch (error) {
        // Error is already handled by the API functions
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const toggleMode = (): void => {
    setIsLogin(!isLogin);
    formik.resetForm();
  };

  const handleSocialLogin = async (provider: "google"): Promise<void> => {
    try {
      toast.loading(`Redirecting to ${provider} login...`);
      // In a real implementation, you would redirect to your backend OAuth endpoint
      // window.location.href = `${BASE_URL}/auth/${provider}`;
    } catch (error) {
      toast.error(`Failed to initiate ${provider} login`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center w-screen p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-pink-400/20 to-yellow-400/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-indigo-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Hero content */}
        <div className="hidden lg:flex flex-col items-center justify-center text-center space-y-8 px-8">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-primary-main to-primary-secondary rounded-3xl flex items-center justify-center shadow-2xl transform rotate-6 hover:rotate-12 transition-transform duration-300">
              <BookOpen className="w-16 h-16 text-white" />
            </div>
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <Star className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="space-y-6 max-w-lg">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-main to-primary-secondary bg-clip-text text-transparent leading-tight">
              Family Values & Life Skills Academy
            </h1>

            <p className="text-xl text-slate-600 leading-relaxed">
              Empowering families through interactive learning, character
              building, and AI-powered storytelling adventures.
            </p>

            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="group cursor-pointer">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mb-3 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm font-medium text-slate-700">
                  Character Building
                </p>
              </div>

              <div className="group cursor-pointer">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center mb-3 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm font-medium text-slate-700">
                  Life Skills
                </p>
              </div>

              <div className="group cursor-pointer">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mb-3 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm font-medium text-slate-700">
                  Gamified Learning
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
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
                {isLogin ? "Welcome back!" : "Create account"}
              </CardTitle>
              <CardDescription className="text-base text-slate-600">
                {isLogin
                  ? "Sign in to continue your learning journey"
                  : "Join thousands of families building character together"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={formik.handleSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-slate-700">
                        Full Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="Enter your full name"
                          className="pl-10 h-12 text-base border-slate-200 focus:border-primary-secondary focus:ring-primary-secondary"
                          value={formik.values.name}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                      </div>
                      {formik.errors.name && formik.touched.name && (
                        <p className="text-sm text-red-500 mt-1">
                          {formik.errors.name}
                        </p>
                      )}
                    </div>

                    {/* <div className="space-y-2">
                      <Label className="text-slate-700">I am a</Label>
                      <div className="flex space-x-4">
                        {Object.values(UserRole).map((role) => (
                          <div
                            key={role}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`role-${role}`}
                              checked={formik.values.role === role}
                              onCheckedChange={() => {
                                formik.setFieldValue("role", role);
                              }}
                            />
                            <Label
                              htmlFor={`role-${role}`}
                              className="capitalize"
                            >
                              {role}
                            </Label>
                          </div>
                        ))}
                      </div>
                      {formik.errors.role && formik.touched.role && (
                        <p className="text-sm text-red-500 mt-1">
                          {formik.errors.role}
                        </p>
                      )}
                    </div> */}
                  </>
                )}

                {/* {isLogin && (
                  <div className="space-y-2">
                    <Label className="text-slate-700">Login as</Label>
                    <div className="flex space-x-4">
                      {[UserRole.PARENT, UserRole.CHILD, UserRole.ADMIN].map(
                        (role) => (
                          <Button
                            key={role}
                            type="button"
                            variant={
                              formik.values.role === role
                                ? "default"
                                : "outline"
                            }
                            className="capitalize"
                            onClick={() => formik.setFieldValue("role", role)}
                          >
                            {role}
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                )} */}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700">
                    Email
                  </Label>
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

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
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

                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-slate-700">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        className="pl-10 h-12 text-base border-slate-200 focus:border-primary-secondary focus:ring-primary-secondary"
                        value={formik.values.confirmPassword}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                    </div>
                    {formik.errors.confirmPassword &&
                      formik.touched.confirmPassword && (
                        <p className="text-sm text-red-500 mt-1">
                          {formik.errors.confirmPassword}
                        </p>
                      )}
                  </div>
                )}

                {isLogin && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="remember" />
                      <Label
                        htmlFor="remember"
                        className="text-sm text-slate-600"
                      >
                        Remember me
                      </Label>
                    </div>
                    <Button
                      type="button"
                      variant="link"
                      className="px-0 text-primary-secondary hover:text-primary-main"
                      onClick={() => {
                        router.push("/forgot-password");
                      }}
                    >
                      Forgot password?
                    </Button>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold bg-primary-secondary text-white hover:from-[#032d5a] hover:to-[#3a7bd5] transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Loading..."
                  ) : (
                    <>
                      {isLogin ? "Sign in" : "Create account"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 border-slate-200 hover:bg-slate-50"
                  onClick={() => handleSocialLogin("google")}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-600">
                  {isLogin
                    ? "Don't have an account?"
                    : "Already have an account?"}
                  <Button
                    type="button"
                    variant="link"
                    className="px-1 font-semibold text-primary-secondary hover:text-primary-main"
                    onClick={toggleMode}
                  >
                    {isLogin ? "Create account" : "Sign in"}
                  </Button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
