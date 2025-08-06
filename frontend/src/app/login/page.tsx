"use client";
import React, { act, useState } from "react";
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
import { useDispatch } from "react-redux";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types/auth";
import toast from "react-hot-toast";
import { api, handleApiError } from "@/api/api";
import { ResponseInterface } from "@/types/interfaces";
import axios from "axios";
import { BASE_URL, errorStyles, successStyles } from "@/lib/constants";
import { loginSuccess } from "@/store/slices/authSlice";
import Image from "next/image";

interface FormValues {
  email: string;
  username: string;
  password: string;
  name: string;
  confirmPassword: string;
  role: UserRole;
}

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"parent" | "child">("parent");
  const router = useRouter();
  const dispatch = useDispatch();

  const authRequest = async (credentials: {
    email?: string;
    username?: string;
    password: string;
    role: UserRole;
  }) => {
    try {
      const endpoint =
        activeTab === "parent"
          ? `${BASE_URL}/auth/login`
          : `${BASE_URL}/child/login`;

      const response = await axios.post(endpoint, credentials, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      if (response.data?.success) {
        localStorage.setItem("token", response.data.data.token);
        dispatch(
          loginSuccess({
            user: {
              ...response.data.data.user,
              role: response.data.data.user.role,
            },
            token: response.data.data.token,
          })
        );
        return response.data;
      }
      throw new Error("Login failed");
    } catch (error) {
      handleApiError(error, "Login failed");
      throw error;
    }
  };

  const register = async (userData: {
    firstName: string;
    lastName: string;
    email?: string;
    username?: string;
    password: string;
    role: UserRole;
  }) => {
    try {
      const endpoint =
        activeTab === "parent"
          ? `${BASE_URL}/auth/register`
          : `${BASE_URL}/auth/register-child`;

      const response: ResponseInterface = await axios.post(endpoint, userData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error: any) {
      handleApiError(error);
    }
  };

  const validationSchema = Yup.object({
    ...(activeTab === "parent" && {
      email: Yup.string()
        .email("Invalid email format")
        .required("Email is required"),
    }),
    ...(activeTab === "child" && {
      username: Yup.string()
        .required("Username is required")
        .min(3, "Username must be at least 3 characters"),
    }),
    password: Yup.string().required("Password is required"),
    ...(!isLogin && {
      name: Yup.string().required("Full name is required"),
      confirmPassword: Yup.string()
        .required("Please confirm your password")
        .oneOf([Yup.ref("password")], "Passwords must match"),
    }),
  });

  const formik = useFormik<FormValues>({
    initialValues: {
      email: "",
      username: "",
      password: "",
      name: "",
      confirmPassword: "",
      role: activeTab === "parent" ? UserRole.PARENT : UserRole.CHILD,
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        if (isLogin) {
          const response = await authRequest({
            [activeTab === "parent" ? "email" : "username"]:
              activeTab === "parent" ? values.email : values.username,
            password: values.password,
            role: activeTab === "parent" ? UserRole.PARENT : UserRole.CHILD,
          });

          if (response.success) {
            toast.success(response.message, successStyles);
            router.push(
              activeTab === "parent" ? "/parent/dashboard" : "/child/dashboard"
            );
          }
        } else {
          // Handle registration
          const [firstName, ...lastNameParts] = values.name.split(" ");
          const lastName = lastNameParts.join(" ");
          if (!lastName) {
            toast.error("Last Name is required!", errorStyles);
            return;
          }

          const response = await register({
            firstName,
            lastName,
            [activeTab === "parent" ? "email" : "username"]:
              activeTab === "parent" ? values.email : values.username,
            password: values.password,
            role: activeTab === "parent" ? UserRole.PARENT : UserRole.CHILD,
          });

          if (response.success) {
            toast.success(response.message, successStyles);
            if (activeTab === "parent") {
              router.push(`/verify?email=${values.email}`);
            } else {
              router.push(`/child/dashboard`);
            }
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

  const handleTabChange = (value: "parent" | "child") => {
    setActiveTab(value);
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

  // Handle PIN input for child login
  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and limit to 4 digits
    if (/^\d*$/.test(value) && value.length <= 4) {
      formik.setFieldValue("password", value);
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
        <div className="hidden lg:flex flex-col items-center justify-center text-center space-y-8 x px-8">
          <div className="relative">
            <div className="w-32 h-32  rounded-3xl flex items-center justify-center  transform rotate-6 hover:rotate-12 transition-transform duration-300">
              <Image
                src={"/logo.png"}
                alt="Enteteye Logo"
                width={150}
                height={150}
              />
            </div>
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <Star className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="space-y-6 max-w-lg">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-main to-primary-secondary bg-clip-text text-transparent leading-tight">
              Enteteye Academy{" "}
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

              {/* Tabs for parent/child selection */}
              {isLogin && (
                <Tabs
                  value={activeTab}
                  onValueChange={(value) =>
                    handleTabChange(value as "parent" | "child")
                  }
                  className="w-full pt-6"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="parent">Parent</TabsTrigger>
                    <TabsTrigger value="child">Child</TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={formik.handleSubmit} className="space-y-4">
                {!isLogin && (
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
                )}

                {activeTab === "parent" ? (
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        id="email"
                        name="email"
                        type="text"
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
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-slate-700">
                      Username
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="Enter your username"
                        className="pl-10 h-12 text-base border-slate-200 focus:border-primary-secondary focus:ring-primary-secondary"
                        value={formik.values.username}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                    </div>
                    {formik.errors.username && formik.touched.username && (
                      <p className="text-sm text-red-500 mt-1">
                        {formik.errors.username}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700">
                    {activeTab === "child" && isLogin
                      ? "4-digit PIN"
                      : "Password"}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    {activeTab === "child" && isLogin ? (
                      <Input
                        id="password"
                        name="password"
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Enter your 4-digit PIN"
                        className="pl-10 h-12 text-base border-slate-200 focus:border-primary-secondary focus:ring-primary-secondary"
                        value={formik.values.password}
                        onChange={handlePinChange}
                        onBlur={formik.handleBlur}
                        maxLength={4}
                      />
                    ) : (
                      <>
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder={
                            activeTab === "child"
                              ? "Set your 4-digit PIN"
                              : "Enter your password"
                          }
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
                      </>
                    )}
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
                      Confirm {activeTab === "child" ? "PIN" : "Password"}
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      {activeTab === "child" ? (
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="number"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="Confirm your 4-digit PIN"
                          className="pl-10 h-12 text-base border-slate-200 focus:border-primary-secondary focus:ring-primary-secondary"
                          value={formik.values.confirmPassword}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d*$/.test(value) && value.length <= 4) {
                              formik.setFieldValue("confirmPassword", value);
                            }
                          }}
                          onBlur={formik.handleBlur}
                          maxLength={4}
                        />
                      ) : (
                        <>
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
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
                        </>
                      )}
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
                    {activeTab === "parent" && (
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
                    )}
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

              {activeTab === "parent" && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    {isLogin && (
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-slate-500">
                          Or continue with
                        </span>
                      </div>
                    )}{" "}
                  </div>
                  {isLogin && (
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
                  )}{" "}
                </>
              )}
              {activeTab === "parent" && (
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
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
