"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { UserRole } from "../types/auth";
import Loading from "@/app/loading";
import { api } from "@/api/api";
import { ResponseInterface } from "@/types/interfaces";
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
  const { user, token, isAuthenticated, loading } = useAuth();
  const dispatch = useDispatch();
  const router = useRouter();

  const refreshToken = async () => {
    try {
      const response: ResponseInterface = await axios.get(
        `${BASE_URL}/auth/refresh`,
        {
          withCredentials: true,
        }
      );

      if (response.data.data) {
        dispatch(
          loginSuccess({
            user: response.data.data.user,
            token: response.data.data.token,
          })
        );
        return true;
      }
    } catch (error) {
      handleApiError(error, "Session refresh failed");
      dispatch(logout());
      return false;
    }
    return false;
  };

  useEffect(() => {
    const checkAuth = async () => {
      if (loading) return;

      if (!isAuthenticated && token) {
        const refreshed = await refreshToken();
        if (!refreshed) {
          router.push("/login");
          return;
        }
      }

      if (!isAuthenticated) {
        router.push("/login");
        return;
      }
    };

    checkAuth();
  }, [isAuthenticated, user, loading, router, token, dispatch]);

  if (loading || !isAuthenticated) {
    return <Loading />;
  }

  return <>{children}</>;
}
