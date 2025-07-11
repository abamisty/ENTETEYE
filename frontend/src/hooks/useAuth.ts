import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import { loginStart, logout, updateUser } from "../store/slices/authSlice";
import { useCallback } from "react";
import { AppUser, UserRole } from "@/types/auth";

export const useAuth = () => {
  const { user, token, loading, error } = useSelector(
    (state: RootState) => state.auth
  );
  const dispatch = useDispatch<AppDispatch>();

  const login = useCallback(
    (credentials: any) => {
      dispatch(loginStart(credentials));
    },
    [dispatch]
  );

  const signOut = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  const updateUserProfile = useCallback(
    (updatedFields: Partial<AppUser>) => {
      dispatch(updateUser(updatedFields));
    },
    [dispatch]
  );

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!user && !!token,
    login,
    logout: signOut,
    updateUserProfile,
  };
};
