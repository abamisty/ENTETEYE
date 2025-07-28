"use client";
import React, { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Shield,
  ShieldOff,
  Calendar,
  Mail,
  Phone,
  MapPin,
  SortAsc,
  SortDesc,
  Download,
  UserPlus,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { adminApi } from "@/api/admin";

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "child" | "parent" | "teacher";
  isActive: boolean;
  ageGroup?: string;
  phoneNumber?: string;
  location?: string;
  createdAt: string;
  lastLoginAt?: string;
  enrolledCoursesCount?: number;
  completedCoursesCount?: number;
  avatar?: string;
}

interface Stat {
  name: string;
  value: number | string;
  icon: React.ComponentType;
  change?: string;
  changeType?: "increase" | "decrease";
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
}

const AdminUsersPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [ageGroupFilter, setAgeGroupFilter] = useState("All Ages");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const router = useRouter();

  const [stats, setStats] = useState<Stat[]>([
    {
      name: "Total Users",
      value: 0,
      icon: Users,
      change: "+12%",
      changeType: "increase",
    },
    {
      name: "Active Users",
      value: 0,
      icon: UserCheck,
      change: "+5%",
      changeType: "increase",
    },
    {
      name: "New This Month",
      value: 0,
      icon: UserPlus,
      change: "+18%",
      changeType: "increase",
    },
    {
      name: "Inactive Users",
      value: 0,
      icon: UserX,
      change: "-3%",
      changeType: "decrease",
    },
  ]);

  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
  });

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllUsers();
      const usersData = response?.data || [];
      setUsers(usersData);
      updateStats(usersData);
    } catch (error) {
      toast.error("Failed to fetch users");
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update statistics
  const updateStats = (usersData: User[]) => {
    const activeUsers = usersData.filter((user) => user.isActive).length;
    const inactiveUsers = usersData.filter((user) => !user.isActive).length;
    const newThisMonth = usersData.filter((user) => {
      const userDate = new Date(user.createdAt);
      const now = new Date();
      const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
      return userDate >= monthAgo;
    }).length;

    setStats([
      {
        name: "Total Users",
        value: usersData.length,
        icon: Users,
        change: "+12%",
        changeType: "increase",
      },
      {
        name: "Active Users",
        value: activeUsers,
        icon: UserCheck,
        change: "+5%",
        changeType: "increase",
      },
      {
        name: "New This Month",
        value: newThisMonth,
        icon: UserPlus,
        change: "+18%",
        changeType: "increase",
      },
      {
        name: "Inactive Users",
        value: inactiveUsers,
        icon: UserX,
        change: "-3%",
        changeType: "decrease",
      },
    ]);
  };
  console.log(users);
  // Filter and sort users
  const filterAndSortUsers = () => {
    let filtered = users.filter((user) => {
      const matchesSearch =
        user.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole =
        roleFilter === "All Roles" || user.role === roleFilter.toLowerCase();
      const matchesStatus =
        statusFilter === "All Status" ||
        (statusFilter === "Active" && user.isActive) ||
        (statusFilter === "Inactive" && !user.isActive);
      const matchesAge =
        ageGroupFilter === "All Ages" || user.ageGroup === ageGroupFilter;

      return matchesSearch && matchesRole && matchesStatus && matchesAge;
    });

    // Sort users
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = `${a.firstName} ${a.lastName}`.localeCompare(
            `${b.firstName} ${b.lastName}`
          );
          break;
        case "email":
          comparison = a.email.localeCompare(b.email);
          break;
        case "role":
          comparison = a.role.localeCompare(b.role);
          break;
        case "createdAt":
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "lastLogin":
          const dateA = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0;
          const dateB = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0;
          comparison = dateA - dateB;
          break;
        default:
          comparison = 0;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    // Apply pagination
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    const paginatedUsers = filtered.slice(startIndex, endIndex);

    setFilteredUsers(paginatedUsers);
    setPagination((prev) => ({ ...prev, total: filtered.length }));
  };

  // Handle user actions
  const handleToggleUserStatus = async (
    userId: string,
    currentStatus: boolean
  ) => {
    try {
      // This would be an API call to toggle user status
      // await userApi.toggleUserStatus(userId, !currentStatus);

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, isActive: !currentStatus } : user
        )
      );

      toast.success(
        `User ${!currentStatus ? "activated" : "deactivated"} successfully`
      );
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const handleViewUser = (userId: string) => {
    router.push(`/admin/users/${userId}`);
  };

  const handleBulkAction = (action: string) => {
    if (selectedUsers.length === 0) {
      toast.error("Please select users first");
      return;
    }

    // Handle bulk actions here
    toast.success(`${action} applied to ${selectedUsers.length} users`);
    setSelectedUsers([]);
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "teacher":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "parent":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "child":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterAndSortUsers();
  }, [
    users,
    searchTerm,
    roleFilter,
    statusFilter,
    ageGroupFilter,
    sortBy,
    sortOrder,
    pagination.page,
  ]);

  return (
    <div className="min-h-screen bg-gray-50 text-text2 dark:bg-gray-900 dark:text-text1">
      {/* Header */}
      <header className="bg-primary-main text-text1 p-4 shadow-md rounded-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-primary-light mt-1">
              Manage and monitor all platform users
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleBulkAction("Export")}
              className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-md flex items-center text-sm"
            >
              <Download className="mr-2 w-4 h-4" /> Export
            </button>
            <button
              onClick={() => router.push("/admin/users/invite")}
              className="bg-primary-secondary hover:bg-blue-600 px-4 py-2 rounded-md flex items-center"
            >
              <UserPlus className="mr-2 w-4 h-4" /> Invite User
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-primary-main/10 text-primary-main mr-4">
                    <stat.icon />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-semibold">{stat.value}</p>
                  </div>
                </div>
                {stat.change && (
                  <div
                    className={`text-sm font-medium ${
                      stat.changeType === "increase"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {stat.change}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users by name, email, username..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main dark:bg-gray-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <select
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-main dark:bg-gray-700 text-sm"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option>All Roles</option>
                <option>Admin</option>
                <option>Teacher</option>
                <option>Parent</option>
                <option>Child</option>
              </select>

              <select
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-main dark:bg-gray-700 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>

              <select
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-main dark:bg-gray-700 text-sm"
                value={ageGroupFilter}
                onChange={(e) => setAgeGroupFilter(e.target.value)}
              >
                <option>All Ages</option>
                <option>10-12</option>
                <option>13-15</option>
                <option>16-18</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="mt-4 p-3 bg-primary-main/5 rounded-md border border-primary-main/20">
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary-main font-medium">
                  {selectedUsers.length} user(s) selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkAction("Activate")}
                    className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                  >
                    Activate
                  </button>
                  <button
                    onClick={() => handleBulkAction("Deactivate")}
                    className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                  >
                    Deactivate
                  </button>
                  <button
                    onClick={() => setSelectedUsers([])}
                    className="text-sm bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-main"></div>
          </div>
        )}

        {/* Users Table/Grid */}
        {!loading && (
          <>
            {/* Table Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={
                        selectedUsers.length === filteredUsers.length &&
                        filteredUsers.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(
                            filteredUsers.map((user) => user.id)
                          );
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                      className="rounded border-gray-300 text-primary-main focus:ring-primary-main"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Users ({pagination.total})
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-500">Sort by:</span>
                    <button
                      onClick={() => toggleSort("name")}
                      className={`flex items-center gap-1 px-2 py-1 rounded ${
                        sortBy === "name"
                          ? "bg-primary-main/10 text-primary-main"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      Name{" "}
                      {sortBy === "name" &&
                        (sortOrder === "asc" ? (
                          <SortAsc className="w-3 h-3" />
                        ) : (
                          <SortDesc className="w-3 h-3" />
                        ))}
                    </button>
                    <button
                      onClick={() => toggleSort("createdAt")}
                      className={`flex items-center gap-1 px-2 py-1 rounded ${
                        sortBy === "createdAt"
                          ? "bg-primary-main/10 text-primary-main"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      Date{" "}
                      {sortBy === "createdAt" &&
                        (sortOrder === "asc" ? (
                          <SortAsc className="w-3 h-3" />
                        ) : (
                          <SortDesc className="w-3 h-3" />
                        ))}
                    </button>
                    <button
                      onClick={() => toggleSort("lastLogin")}
                      className={`flex items-center gap-1 px-2 py-1 rounded ${
                        sortBy === "lastLogin"
                          ? "bg-primary-main/10 text-primary-main"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      Activity{" "}
                      {sortBy === "lastLogin" &&
                        (sortOrder === "asc" ? (
                          <SortAsc className="w-3 h-3" />
                        ) : (
                          <SortDesc className="w-3 h-3" />
                        ))}
                    </button>
                  </div>
                </div>
              </div>

              {/* Users List */}
              <div className="divide-y divide-gray-200 dark:divide-gray-600">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers([...selectedUsers, user.id]);
                            } else {
                              setSelectedUsers(
                                selectedUsers.filter((id) => id !== user.id)
                              );
                            }
                          }}
                          className="rounded border-gray-300 text-primary-main focus:ring-primary-main"
                        />

                        {/* User Avatar */}
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-main to-primary-secondary rounded-full flex items-center justify-center text-white font-semibold">
                          {user.user.avatar ? (
                            <img
                              src={user.user.avatar}
                              alt={user.user.firstName}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            `${user.user.firstName[0]}${user.user.lastName[0]}`
                          )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {user.user.firstName} {user.user.lastName}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                                user.user.role
                              )}`}
                            >
                              {user.user.role.charAt(0).toUpperCase() +
                                user.user.role.slice(1)}
                            </span>
                            <div
                              className={`w-2 h-2 rounded-full ${
                                user.user.isActive
                                  ? "bg-green-400"
                                  : "bg-red-400"
                              }`}
                            />
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {user.user.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Joined {formatDate(user.user.createdAt)}
                            </span>
                            {user.user.lastLoginAt && (
                              <span className="flex items-center gap-1">
                                <UserCheck className="w-4 h-4" />
                                Last active {formatDate(user.user.lastLoginAt)}
                              </span>
                            )}
                          </div>

                          {/* Additional User Details */}
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-300">
                            {user.user.phoneNumber && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {user.user.phoneNumber}
                              </span>
                            )}
                            {user.user.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {user.user.location}
                              </span>
                            )}
                            {user.user.enrolledCoursesCount !== undefined && (
                              <span className="text-primary-main font-medium">
                                {user.user.enrolledCoursesCount} courses
                                enrolled
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewUser(user.id)}
                          className="p-2 text-gray-600 hover:text-primary-main hover:bg-primary-main/10 rounded-md transition-colors"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() =>
                            handleToggleUserStatus(user.id, user.isActive)
                          }
                          className={`p-2 rounded-md transition-colors ${
                            user.isActive
                              ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                              : "text-green-600 hover:text-green-700 hover:bg-green-50"
                          }`}
                          title={
                            user.isActive ? "Deactivate User" : "Activate User"
                          }
                        >
                          {user.isActive ? (
                            <ShieldOff className="w-4 h-4" />
                          ) : (
                            <Shield className="w-4 h-4" />
                          )}
                        </button>

                        <div className="relative group">
                          <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {/* Dropdown menu would go here */}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination */}
            {pagination.total > pagination.limit && (
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{" "}
                  of {pagination.total} users
                </div>

                <nav className="flex items-center space-x-2">
                  <button
                    className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
                    disabled={pagination.page === 1}
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page - 1,
                      }))
                    }
                  >
                    Previous
                  </button>

                  {Array.from(
                    { length: Math.ceil(pagination.total / pagination.limit) },
                    (_, i) => i + 1
                  )
                    .filter((page) => {
                      const current = pagination.page;
                      return (
                        page === 1 ||
                        page ===
                          Math.ceil(pagination.total / pagination.limit) ||
                        (page >= current - 1 && page <= current + 1)
                      );
                    })
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-gray-500">...</span>
                        )}
                        <button
                          className={`px-3 py-1 rounded-md ${
                            pagination.page === page
                              ? "bg-primary-main text-white"
                              : "border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                          onClick={() =>
                            setPagination((prev) => ({ ...prev, page }))
                          }
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    ))}

                  <button
                    className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
                    disabled={
                      pagination.page * pagination.limit >= pagination.total
                    }
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page + 1,
                      }))
                    }
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!loading && filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {users.length === 0
                ? "No users found"
                : "No users match your filters"}
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {users.length === 0
                ? "Users will appear here once they join the platform"
                : "Try adjusting your search or filter criteria"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminUsersPage;
