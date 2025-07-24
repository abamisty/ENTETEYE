"use client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import Loading from "@/app/loading";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { loginSuccess, logout } from "../store/slices/authSlice";
import axios from "axios";
import { BASE_URL } from "@/lib/constants";

interface AuthRouteProps {
  children: React.ReactNode;
}

const handleApiError = (error: any, defaultMessage: string) => {
  const message = error.response?.data?.message || defaultMessage;
  toast.error(message);
};

export default function AuthRoute({ children }: AuthRouteProps) {
  const { user, token, isAuthenticated } = useAuth();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check if current route is auth-related
  const isAuthRoute = ["/login", "/child-login"].includes(pathname);

  const refreshToken = async () => {
    try {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        throw new Error("No token found");
      }

      const response = await axios.get(`${BASE_URL}/auth/refresh-token`, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
        withCredentials: true,
      });

      if (response.data?.success) {
        const { token: newToken, user: userData } = response.data;
        localStorage.setItem("token", newToken);

        dispatch(
          loginSuccess({
            user: userData,
            token: newToken,
          })
        );
        return true;
      }
      return false;
    } catch (error) {
      localStorage.removeItem("token");
      handleApiError(error, "Session refresh failed");
      dispatch(logout());
      return false;
    }
  };

  const redirectToProperLogin = () => {
    if (pathname.startsWith("/child")) {
      router.push("/child-login");
    } else {
      router.push("/login");
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      // Skip auth check for auth routes
      if (isAuthRoute) {
        setLoading(false);
        return;
      }

      setLoading(true);

      if (!token) {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
          try {
            const response = await axios.get(`${BASE_URL}/auth/refresh-token`, {
              headers: {
                Authorization: `Bearer ${storedToken}`,
              },
              withCredentials: true,
            });

            if (response.data?.success) {
              dispatch(
                loginSuccess({
                  user: response.data.user,
                  token: storedToken,
                })
              );
              setLoading(false);
              return;
            }
          } catch (error) {
            localStorage.removeItem("token");
          }
        }
      }

      if (!isAuthenticated && token) {
        const refreshed = await refreshToken();
        if (!refreshed) {
          redirectToProperLogin();
          return;
        }
      }

      if (!isAuthenticated) {
        redirectToProperLogin();
        return;
      }

      // Check if user type matches route
      if (user?.role === "child" && !pathname.startsWith("/child")) {
        router.push("/child/dashboard");
        return;
      }

      if (user?.role === "parent" && pathname.startsWith("/child")) {
        router.push("/parent/dashboard");
        return;
      }

      setLoading(false);
    };

    checkAuth();
  }, [
    isAuthenticated,
    token,
    router,
    dispatch,
    isAuthRoute,
    pathname,
    user?.role,
  ]);

  if (loading) {
    return <Loading />;
  }

  if (isAuthRoute) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
