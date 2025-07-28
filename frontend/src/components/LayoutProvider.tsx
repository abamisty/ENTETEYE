"use client";
import React, { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Header from "./General/Header";
import SideBar from "./General/Sidebar";
import Loading from "@/app/loading";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/auth";
import AuthRoute from "./AuthRoute";

interface LayoutProviderProps {
  children: ReactNode;
}

const unprotectedRoutes = [
  "/login",
  "/sign-up",
  "/verify",
  "/forgot-password",
  "/reset-password",
  "/setup/contact",
  "/setup/company",
  "/terms",
  "/privacy",
];

const protectedRoutes: any = {
  common: ["/dashboard", "/profile", "/settings"],
  [UserRole.ADMIN]: ["/admin/dashboard", "/users", "/analytics", "/settings"],
  [UserRole.PARENT]: ["/", "/children", "/reports", "/settings"],
  [UserRole.CHILD]: [
    "/child/dashboard",
    "/games",
    "/rewards",
    "/child/courses",
    "/settings",
  ],
};

const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
  const path = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [isProtected, setIsProtected] = useState<boolean>(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  console.log(user);
  useEffect(() => {
    if (!path) return;

    const isUnprotectedRoute = unprotectedRoutes.includes(path);
    setIsProtected(!isUnprotectedRoute);

    if (!isUnprotectedRoute && !loading) {
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }

      const allAllowedRoutes = [
        ...protectedRoutes.common,
        ...(user?.role ? protectedRoutes[user.role] : []),
      ];

      const isRouteAuthorized = allAllowedRoutes.some((route) =>
        path.startsWith(route)
      );

      if (!isRouteAuthorized) {
        const defaultRoute = user?.role
          ? protectedRoutes[user.role][0]
          : "/login";
        router.push(defaultRoute);
        return;
      }

      setIsAuthorized(true);
    } else {
      setIsAuthorized(true);
    }
  }, [path, isAuthenticated, loading, user, router]);

  if (!path || loading) return <Loading />;

  if (isProtected && (!isAuthenticated || !isAuthorized)) {
    return <Loading />;
  }

  return (
    <>
      {isProtected ? (
        <AuthRoute>
          <div className="h-screen overflow-hidden bg-black  flex flex-col">
            <Header user={user} />
            <div className="flex flex-1 overflow-hidden">
              <SideBar userRole={user?.role || UserRole.PARENT} />
              <main className="flex-1  pb-[5rem] min-h-screen overflow-auto bg-[#FBFBFB] min-w-0">
                <div className="h-max p-6">{children}</div>
              </main>
            </div>
          </div>
        </AuthRoute>
      ) : (
        <main className="w-full">{children}</main>
      )}
    </>
  );
};

export default LayoutProvider;
