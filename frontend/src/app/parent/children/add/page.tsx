"use client";
import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ArrowLeft,
  User,
  Calendar,
  VenusAndMars,
  AtSign,
  Lock,
} from "lucide-react";
import { parentApi } from "@/api/parent";
import toast from "react-hot-toast";
import { successStyles, errorStyles } from "@/lib/constants";

interface ChildFormValues {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  gender: string;
}

const AddChildPage = () => {
  const router = useRouter();

  const validationSchema = Yup.object({
    firstName: Yup.string()
      .required("First name is required")
      .max(50, "First name must be less than 50 characters"),
    lastName: Yup.string()
      .required("Last name is required")
      .max(50, "Last name must be less than 50 characters"),
    username: Yup.string()
      .required("Username is required")
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be less than 20 characters")
      .matches(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      ),
    password: Yup.string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: Yup.string()
      .required("Please confirm your password")
      .oneOf([Yup.ref("password")], "Passwords must match"),
    dateOfBirth: Yup.date()
      .required("Date of birth is required")
      .max(new Date(), "Date of birth cannot be in the future"),
    gender: Yup.string()
      .required("Gender is required")
      .oneOf(["Male", "Female", "Other"], "Please select a valid gender"),
  });

  const formik = useFormik<ChildFormValues>({
    initialValues: {
      firstName: "",
      lastName: "",
      username: "",
      password: "",
      confirmPassword: "",
      dateOfBirth: "",
      gender: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        // Destructure to remove confirmPassword before sending
        const { confirmPassword, ...childData } = values;
        const response = await parentApi.addChild(childData);

        if (response.success) {
          router.push("/parent/children");
        }
      } catch (error) {}
    },
  });

  return (
    <div className="w-full">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-slate-600 mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-primary-secondary hover:text-primary-main mr-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </button>
        <span className="mx-2">/</span>
        <span className="text-slate-500">Add Child</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-main mb-2">
          Add a Child
        </h1>
        <p className="text-slate-600">
          Fill in your child's details to create their profile
        </p>
      </div>

      <Card className="shadow-lg border border-slate-200 backdrop-blur-sm bg-white">
        <CardHeader>
          <CardTitle className="text-2xl text-primary-main">
            Child Information
          </CardTitle>
          <CardDescription>
            Please provide your child's personal details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-slate-700">
                  First Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Child's first name"
                    className="pl-10 h-12 text-base border-slate-200 focus:border-primary-secondary focus:ring-primary-secondary"
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
                {formik.errors.firstName && formik.touched.firstName && (
                  <p className="text-sm text-red-500 mt-1">
                    {formik.errors.firstName}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-slate-700">
                  Last Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Child's last name"
                    className="pl-10 h-12 text-base border-slate-200 focus:border-primary-secondary focus:ring-primary-secondary"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
                {formik.errors.lastName && formik.touched.lastName && (
                  <p className="text-sm text-red-500 mt-1">
                    {formik.errors.lastName}
                  </p>
                )}
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-700">
                  Username
                </Label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Choose a username"
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

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    className="pl-10 h-12 text-base border-slate-200 focus:border-primary-secondary focus:ring-primary-secondary"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
                {formik.errors.password && formik.touched.password && (
                  <p className="text-sm text-red-500 mt-1">
                    {formik.errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
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

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-slate-700">
                  Date of Birth
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    className="pl-10 h-12 text-base border-slate-200 focus:border-primary-secondary focus:ring-primary-secondary"
                    value={formik.values.dateOfBirth}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
                {formik.errors.dateOfBirth && formik.touched.dateOfBirth && (
                  <p className="text-sm text-red-500 mt-1">
                    {formik.errors.dateOfBirth}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-slate-700">
                  Gender
                </Label>
                <div className="relative">
                  <VenusAndMars className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <select
                    id="gender"
                    name="gender"
                    className="w-full pl-10 h-12 text-base border border-slate-200 rounded-md focus:border-primary-secondary focus:ring-primary-secondary bg-white"
                    value={formik.values.gender}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                {formik.errors.gender && formik.touched.gender && (
                  <p className="text-sm text-red-500 mt-1">
                    {formik.errors.gender}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="h-12 border-slate-200 hover:bg-slate-50"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-12 text-base font-semibold bg-primary-secondary text-white hover:bg-primary-main transition-colors duration-200 shadow-sm"
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting ? "Saving..." : "Add Child"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddChildPage;
