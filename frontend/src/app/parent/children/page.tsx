"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Flame,
  Star,
  Trophy,
  BookOpen,
  User,
  MoreVertical,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { parentApi } from "@/api/parent";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Child {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  birthDate: string;
  gender: "Male" | "Female" | "Other";
  totalPoints: number;
  currentStreak: number;
  learningProgress: number;
  favoriteSubject?: string;
}

const ChildrenDashboard = () => {
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleDeleteChild = async (childId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this child? This action cannot be undone."
    );

    if (!confirmDelete) return;

    const data = await parentApi.deleteChild(childId);
    if (data?.success) {
      await fetchChildren();
    }
  };

  const fetchChildren = async () => {
    setLoading(true);
    try {
      const data = await parentApi.getAllChildren();
      if (data?.success) {
        setChildren(data.data);
      }
    } catch (error) {
      console.error("Error fetching children:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  if (loading) {
    return (
      <div className="w-full space-y-6 pb-[4rem]">
        <div className="flex justify-center items-center h-64">
          <p>Loading children...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-[4rem]">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary-main">My Children</h1>
          <p className="text-slate-600">
            Manage and track your children's progress
          </p>
        </div>
        <Button
          className="bg-primary-secondary text-white hover:bg-primary-main"
          onClick={() => router.push("/parent/children/add")}
        >
          Add Child
        </Button>
      </div>

      {/* Stats Summary - Only show if children exist */}
      {children?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-blue-50 border-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">
                Total Children
              </CardTitle>
              <User className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800">
                {children?.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">
                Total Points
              </CardTitle>
              <Star className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-800">
                {children?.reduce((sum, child) => sum + child.totalPoints, 0)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">
                Highest Streak
              </CardTitle>
              <Flame className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-800">
                {Math.max(...children.map((c) => c.currentStreak))} days
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">
                Average Progress
              </CardTitle>
              <BookOpen className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">
                {Math.round(
                  children.reduce(
                    (sum, child) => sum + child.learningProgress,
                    0
                  ) / children.length
                ) || 0}
                %
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Children Grid or Empty State */}
      {children?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child) => (
            <Card key={child.id} className="hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start p-4">
                <CardHeader className="flex flex-row items-center space-x-4 pb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={child.avatarUrl} />
                    <AvatarFallback className="bg-primary-secondary text-white">
                      {getInitials(child.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">
                      {child.displayName}
                    </CardTitle>
                    <p className="text-sm text-slate-500">@{child.username}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-xs bg-slate-100 px-2 py-1 rounded-full">
                        {child.gender}
                      </span>
                      <span className="text-xs bg-slate-100 px-2 py-1 rounded-full ml-2">
                        Age:{" "}
                        {new Date().getFullYear() -
                          new Date(child.birthDate).getFullYear()}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(`/parent/children/${child.id}/edit`)
                      }
                    >
                      Edit Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteChild(child.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Learning Progress</span>
                    <span className="font-medium">
                      {child.learningProgress}%
                    </span>
                  </div>
                  <Progress value={child.learningProgress} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <div>
                      <p className="text-xs text-slate-500">Points</p>
                      <p className="font-medium">{child.totalPoints}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-xs text-slate-500">Streak</p>
                      <p className="font-medium">{child.currentStreak} days</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-slate-500">Level</p>
                      <p className="font-medium">
                        {Math.floor(child.totalPoints / 500) + 1}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-xs text-slate-500">Favorite</p>
                      <p className="font-medium">
                        {child.favoriteSubject || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.push(`/parent/children/${child.id}`)}
                  >
                    View Profile
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() =>
                      router.push(`/parent/children/${child.id}/progress`)
                    }
                  >
                    Progress
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
          <BookOpen className="h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">
            No children found
          </h3>
          <p className="text-slate-500 mb-6">
            Get started by adding your first child
          </p>
          <Button
            className="bg-primary-secondary text-white hover:bg-primary-main"
            onClick={() => router.push("/parent/children/add")}
          >
            Add Child
          </Button>
        </div>
      )}
    </div>
  );
};

export default ChildrenDashboard;
