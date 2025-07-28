"use client";
import React, { useState, useEffect } from "react";
import { AppUser, UserRole, Gender } from "@/types/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { updateUser } from "@/store/slices/authSlice";
import toast from "react-hot-toast";
import { errorStyles, successStyles } from "@/lib/constants";
import {
  Camera,
  Shield,
  CreditCard,
  User,
  Phone,
  Mail,
  Calendar,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { authApi } from "@/api/user";
import { parentApi } from "@/api/parent";

const SettingsPage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState<Partial<AppUser>>({ ...user });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(
    user?.avatar || ""
  );
  const [isEditing, setIsEditing] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    // Set editing based on user role
    setIsEditing(user?.role !== UserRole.CHILD);
  }, [user?.role]);

  const handleProfileChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    if (!isEditing) return;

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditing) return;

    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) return;

    try {
      // Handle avatar upload if needed
      if (avatarFile) {
        // Add your avatar upload logic here
      }

      // Update profile data
      const response = await parentApi.updateProfile(formData);

      dispatch(updateUser(formData));
    } catch (error) {}
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match.", errorStyles);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long.", errorStyles);
      return;
    }

    try {
      const response = await authApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success(
        "Your password has been updated successfully.",
        successStyles
      );
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error("Failed to update password.", errorStyles);
    }
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  const getUserInitials = () => {
    return `${formData.firstName?.[0] || ""}${
      formData.lastName?.[0] || ""
    }`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto py-8 px-4 max-w-6xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary-main/10 rounded-lg">
              <User className="h-8 w-8 text-primary-main" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Account Settings
              </h1>
              <p className="text-gray-600">
                Manage your account information and preferences
              </p>
            </div>
          </div>

          {/* User Status Bar */}
          <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <Avatar className="h-12 w-12">
              <AvatarImage src={avatarPreview} alt="Profile" />
              <AvatarFallback className="bg-primary-main text-white">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {formData.firstName} {formData.lastName}
              </h3>
              <p className="text-sm text-gray-600">{formData.email}</p>
            </div>
            <div className="flex gap-2">
              <Badge
                variant={formData.isEmailVerified ? "default" : "destructive"}
              >
                {formData.isEmailVerified
                  ? "Email Verified"
                  : "Email Unverified"}
              </Badge>
              <Badge
                variant={formData.isPhoneVerified ? "default" : "destructive"}
              >
                {formData.isPhoneVerified
                  ? "Phone Verified"
                  : "Phone Unverified"}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {formData.role}
              </Badge>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 max-w-lg mb-8 bg-white border border-gray-200">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            {user?.role === UserRole.PARENT && (
              <TabsTrigger
                value="subscription"
                className="flex items-center gap-2"
              >
                <CreditCard className="h-4 w-4" />
                Subscription
              </TabsTrigger>
            )}
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* Avatar Section */}
              <Card className="shadow-sm border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5 text-primary-main" />
                    Profile Picture
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={avatarPreview} alt="Profile" />
                      <AvatarFallback className="bg-primary-main text-white text-lg">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Upload a professional photo. Recommended size: 400x400px
                      </p>
                      {isEditing && (
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" asChild>
                            <label className="cursor-pointer">
                              <Camera className="h-4 w-4 mr-2" />
                              Choose Photo
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                                disabled={!isEditing}
                              />
                            </label>
                          </Button>
                          {avatarPreview && (
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => {
                                setAvatarPreview("");
                                setAvatarFile(null);
                              }}
                              disabled={!isEditing}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Basic Information */}
              <Card className="shadow-sm border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary-main" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName || ""}
                        onChange={handleProfileChange}
                        placeholder="Enter your first name"
                        required
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName || ""}
                        onChange={handleProfileChange}
                        placeholder="Enter your last name"
                        required
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender || ""}
                        onChange={handleProfileChange}
                        className="w-full p-2 border rounded-md"
                        disabled={!isEditing}
                      >
                        <option value="">Select gender</option>
                        <option value={Gender.MALE}>Male</option>
                        <option value={Gender.FEMALE}>Female</option>
                        <option value={Gender.OTHER}>Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dob" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Date of Birth
                      </Label>
                      <Input
                        id="dob"
                        name="dob"
                        type="date"
                        value={formatDate(formData.dob)}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="shadow-sm border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary-main" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="flex items-center gap-2"
                      >
                        <Mail className="h-4 w-4" />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email || ""}
                        onChange={handleProfileChange}
                        placeholder="your.email@example.com"
                        required
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="phoneNumber"
                        className="flex items-center gap-2"
                      >
                        <Phone className="h-4 w-4" />
                        Phone Number
                      </Label>
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber || ""}
                        onChange={handleProfileChange}
                        placeholder="+1 (555) 123-4567"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Professional Information (for Parents) */}
              {user?.role === UserRole.PARENT && (
                <Card className="shadow-sm border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary-main" />
                      Professional Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="occupation"
                          className="flex items-center gap-2"
                        >
                          <Briefcase className="h-4 w-4" />
                          Occupation
                        </Label>
                        <Input
                          id="occupation"
                          name="occupation"
                          value={formData.parentProfile?.occupation || ""}
                          onChange={handleProfileChange}
                          placeholder="Your job title or profession"
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="educationLevel"
                          className="flex items-center gap-2"
                        >
                          <GraduationCap className="h-4 w-4" />
                          Education Level
                        </Label>
                        <select
                          id="educationLevel"
                          name="educationLevel"
                          value={formData.parentProfile?.educationLevel || ""}
                          onChange={handleProfileChange}
                          className="w-full p-2 border rounded-md"
                          disabled={!isEditing}
                        >
                          <option value="">Select education level</option>
                          <option value="high_school">High School</option>
                          <option value="associate">Associate Degree</option>
                          <option value="bachelor">Bachelor's Degree</option>
                          <option value="master">Master's Degree</option>
                          <option value="doctorate">Doctorate</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {isEditing && (
                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    className="bg-primary-main hover:bg-primary-secondary text-white px-8 py-2"
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </form>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card className="max-w-2xl shadow-sm border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary-main" />
                  Change Password
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Keep your account secure with a strong password
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter your current password"
                      required
                    />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter your new password (min. 8 characters)"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Password must be at least 8 characters long
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm your new password"
                      required
                    />
                  </div>
                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="bg-primary-main hover:bg-primary-secondary text-white"
                    >
                      Update Password
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab (only for parents) */}
          {user?.role === UserRole.PARENT && (
            <TabsContent value="subscription">
              <Card className="max-w-4xl shadow-sm border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary-main" />
                    Subscription Management
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Manage your subscription plan and billing information
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-primary-main/5 rounded-lg border border-primary-main/20">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              Premium Family Plan
                            </h3>
                            <p className="text-sm text-gray-600">
                              Full access to all features
                            </p>
                          </div>
                          <Badge className="bg-primary-main text-white">
                            Active
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Billing Cycle
                            </Label>
                            <p className="text-sm text-gray-900 font-medium">
                              Monthly
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Next Billing Date
                            </Label>
                            <p className="text-sm text-gray-900 font-medium">
                              January 15, 2024
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Plan Price
                            </Label>
                            <p className="text-sm text-gray-900 font-medium">
                              $29.99/month
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Family Members
                            </Label>
                            <p className="text-sm text-gray-900 font-medium">
                              4 of 6 slots used
                            </p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex flex-wrap gap-3">
                        <Button
                          variant="outline"
                          className="border-primary-main text-primary-main hover:bg-primary-main hover:text-white"
                        >
                          Change Plan
                        </Button>
                        <Button variant="outline">View Billing History</Button>
                        <Button variant="outline">Update Payment Method</Button>
                        <Button
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          Cancel Subscription
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2">
                          Plan Benefits
                        </h4>
                        <ul className="text-sm text-green-800 space-y-1">
                          <li>• Unlimited children profiles</li>
                          <li>• Advanced parental controls</li>
                          <li>• Priority customer support</li>
                          <li>• Educational content library</li>
                          <li>• Screen time analytics</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsPage;
