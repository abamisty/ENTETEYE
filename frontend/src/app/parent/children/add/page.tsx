"use client";
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter, useSearchParams } from "next/navigation";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  User,
  Calendar,
  VenusAndMars,
  AtSign,
  Hash,
  Camera,
} from "lucide-react";
import { parentApi } from "@/api/parent";
import toast from "react-hot-toast";
import { successStyles, errorStyles } from "@/lib/constants";

interface ChildFormValues {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  dateOfBirth: string;
  gender: string;
  avatarUrl: string;
}

// Avatar options for children
const avatarOptions = [
  {
    id: "avatar1",
    src: "https://img.freepik.com/free-vector/cute-cool-boy-dabbing-pose-cartoon-vector-icon-illustration-people-fashion-icon-concept-isolated_138676-5680.jpg?semt=ais_hybrid&w=740&q=80",
    alt: "Child Avatar 1",
  },
  {
    id: "avatar2",
    src: "https://i.pinimg.com/736x/00/e3/ef/00e3ef3b309ca5bd6280aa9f3eeb3e97.jpg",
    alt: "Child Avatar 2",
  },
  {
    id: "avatar3",
    src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSoXGcCXLKjKuJ_JB_PaWHf1pMpoVN2e8fe74c5hgHKp51q45QfShMKLEnIwO4seMLDYUk&usqp=CAU",
    alt: "Child Avatar 3",
  },
  {
    id: "avatar4",
    src: "https://static.vecteezy.com/system/resources/thumbnails/028/794/706/small_2x/cartoon-cute-school-boy-photo.jpg",
    alt: "Child Avatar 4",
  },
];

// PIN Input Component
const PINInput: React.FC<{
  value: string;
  onChange: (value: string) => void;

  onBlur: () => void;
}> = ({ value, onChange, onBlur }) => {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newValue = e.target.value;
    if (newValue.length <= 1 && /^\d*$/.test(newValue)) {
      const newPin = value.split("");
      newPin[index] = newValue;
      onChange(newPin.join(""));

      // Auto-focus next input
      if (newValue && index < 3) {
        const nextInput = document.getElementById(`password-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      const prevInput = document.getElementById(`password-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <div className="flex space-x-2 justify-center">
      {[0, 1, 2, 3].map((index) => (
        <input
          key={index}
          id={`password-${index}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleInputChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onBlur={onBlur}
          className="w-12 h-12 text-center text-lg font-semibold border-2 border-slate-200 rounded-lg focus:border-primary-secondary focus:ring-2 focus:ring-primary-secondary focus:outline-none transition-colors duration-200"
        />
      ))}
    </div>
  );
};

// Avatar Selection Popup Component
const AvatarSelector: React.FC<{
  selectedAvatar: string;
  onSelect: (avatarId: string) => void;
}> = ({ selectedAvatar, onSelect }) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (avatarId: string) => {
    onSelect(avatarId);
    setOpen(false);
  };

  const selectedAvatarData = avatarOptions.find(
    (avatar) => avatar.src === selectedAvatar
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex flex-col items-center space-y-2 cursor-pointer group">
          <div className="relative w-24 h-24 rounded-full border-4 border-dashed border-slate-300 group-hover:border-primary-secondary transition-colors duration-200 flex items-center justify-center bg-slate-50 group-hover:bg-primary-50">
            {selectedAvatarData ? (
              <img
                src={selectedAvatarData.src}
                alt={selectedAvatarData.alt}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <Camera className="w-8 h-8 text-slate-400 group-hover:text-primary-secondary" />
            )}
          </div>
          <span className="text-sm text-slate-600 group-hover:text-primary-secondary">
            {selectedAvatarData ? "Change Avatar" : "Select Avatar"}
          </span>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-center text-primary-main">
            Choose an Avatar
          </DialogTitle>
        </DialogHeader>
        <div className="w-full grid  grid-cols-2 gap-4 p-4 ">
          {avatarOptions.map((avatar) => (
            <div
              key={avatar.id}
              onClick={() => handleSelect(avatar.src)}
              className={`relative cursor-pointer rounded-full w-full flex justify-center h-max  p-2 transition-all duration-200 hover:shadow-lg`}
            >
              <img
                src={avatar.src}
                alt={avatar.alt}
                className="w-28 h-28 object-cover object-center rounded-full"
              />
              {selectedAvatar === avatar.id && (
                <div className="absolute top-1 right-1 w-6 h-6 bg-primary-secondary rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ChildFormPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const childId = searchParams.get("childId");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(!!childId);
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
      .required("PIN is required")
      .length(4, "PIN must be exactly 4 digits")
      .matches(/^\d{4}$/, "PIN must contain only numbers"),
    dateOfBirth: Yup.date()
      .required("Date of birth is required")
      .max(new Date(), "Date of birth cannot be in the future"),
    gender: Yup.string()
      .required("Gender is required")
      .oneOf(["Male", "Female", "Other"], "Please select a valid gender"),
    avatarUrl: Yup.string().required("Please select an avatar for your child"),
  });
  const formik = useFormik<ChildFormValues>({
    initialValues: {
      firstName: "",
      lastName: "",
      username: "",
      password: "",
      dateOfBirth: "",
      gender: "",
      avatarUrl: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        let response;

        if (isEditing && childId) {
          response = await parentApi.updateChild(childId, values);
        } else {
          response = await parentApi.addChild(values);
        }

        if (response?.success) {
          router.push("/parent/children");
        }
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Something went wrong!",
          errorStyles
        );
      }
    },
  });

  useEffect(() => {
    if (childId) {
      const fetchChildData = async () => {
        try {
          const response = await parentApi.getChild(childId);
          if (response.success) {
            const childData = response.data;
            formik.setValues({
              firstName: childData.displayName.split(" ")[0],
              lastName: childData.displayName.split(" ")[1],
              username: childData.username,
              password: "",
              dateOfBirth: childData.birthDate.split("T")[0],
              gender: childData.gender,
              avatarUrl: childData.avatarUrl,
            });
            setIsEditing(true);
          }
        } catch (error) {
          console.log(error);
          toast.error("Failed to fetch child data", errorStyles);
        } finally {
          setIsLoading(false);
        }
      };

      fetchChildData();
    }
  }, [childId]);

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-main"></div>
      </div>
    );
  }

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
        <span className="text-slate-500">
          {isEditing ? "Edit Child" : "Add Child"}
        </span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-main mb-2">
          {isEditing ? "Edit Child Profile" : "Add a Child"}
        </h1>
        <p className="text-slate-600">
          {isEditing
            ? "Update your child's details"
            : "Fill in your child's details to create their profile"}
        </p>
      </div>

      <Card className="shadow-lg border border-slate-200 backdrop-blur-sm bg-white">
        <CardHeader>
          <CardTitle className="text-2xl text-primary-main">
            {isEditing ? "Edit Child Information" : "Child Information"}
          </CardTitle>
          <CardDescription>
            {isEditing
              ? "Update your child's personal details"
              : "Please provide your child's personal details"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Avatar Selection - Top Center */}
            <div className="flex justify-center mb-8">
              <div className="space-y-2">
                <AvatarSelector
                  selectedAvatar={formik.values.avatarUrl}
                  onSelect={(avatarId) =>
                    formik.setFieldValue("avatarUrl", avatarId)
                  }
                />
                {formik.errors.avatarUrl && formik.touched.avatarUrl && (
                  <p className="text-sm text-red-500 text-center">
                    {formik.errors.avatarUrl}
                  </p>
                )}
              </div>
            </div>

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

              {/* PIN Code */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">
                  PIN Code
                </Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 z-10" />
                  <div className="pl-10">
                    <PINInput
                      value={formik.values.password}
                      onChange={(value) =>
                        formik.setFieldValue("password", value)
                      }
                      onBlur={() => formik.setFieldTouched("password", true)}
                    />
                  </div>
                </div>
                {formik.errors.password && formik.touched.password && (
                  <p className="text-sm text-red-500 mt-1 text-center">
                    {formik.errors.password}
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
                {formik.isSubmitting
                  ? "Saving..."
                  : isEditing
                  ? "Update Child"
                  : "Add Child"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChildFormPage;
