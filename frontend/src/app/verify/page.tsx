"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { api } from "@/api/api";
import { ArrowLeft } from "lucide-react";
import { authApi } from "@/api/user";

const VerifyEmailPage = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (!emailParam) {
      toast.error("Email address required for verification");
      router.push("/login");
      return;
    }
    setEmail(emailParam);
    setLoading(false);
  }, [searchParams, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value;
    const newCode = [...code];

    if (/^\d$/.test(value) || value === "") {
      newCode[index] = value;
      setCode(newCode);
      if (value && index < 5) {
        const nextInput = document.getElementById(
          `code-${index + 1}`
        ) as HTMLInputElement;
        nextInput?.focus();
      }
    }

    if (
      e.nativeEvent instanceof KeyboardEvent &&
      e.nativeEvent.key === "Backspace" &&
      !value &&
      index > 0
    ) {
      const prevInput = document.getElementById(
        `code-${index - 1}`
      ) as HTMLInputElement;
      prevInput?.focus();
      newCode[index - 1] = "";
      setCode(newCode);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasteData = e.clipboardData.getData("text").trim();
    if (pasteData.length === 6 && /^\d{6}$/.test(pasteData)) {
      const newCode = pasteData.split("").slice(0, 6);
      setCode(newCode);
      const lastInput = document.getElementById(`code-5}`) as HTMLInputElement;
      lastInput?.focus();
    }
    e.preventDefault();
  };

  const verifyEmail = async () => {
    if (code.join("").length < 6) {
      return toast.error("Incomplete Code!");
    }
    setLoading(true);

    try {
      const data = await authApi.verifyEmail({
        email,
        code: code.join(""),
      });
      if (data?.success) {
        router.push("/login");
        return;
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await api.post("/auth/resend-verification", { email });
      toast.success("Verification code resent!");
    } catch (error) {
      toast.error("Failed to resend verification code");
    }
  };

  if (loading) return null;

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gray-50"
      onPaste={handlePaste}
    >
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-2xl relative">
        <Link
          href="/login"
          className="absolute top-0 left-0 m-4 text-3xl text-primary hover:text-active transition"
        >
          <ArrowLeft />
        </Link>

        <h2 className="text-3xl font-semibold text-center text-primary mb-6">
          Verify Your Account
        </h2>

        <p className="text-center text-gray-600 mb-8">
          Enter the 6-digit verification code sent to your{" "}
          <span className="font-semibold text-primary-secondary">{email}</span>.
        </p>

        <div className="flex justify-center mb-6 space-x-2">
          {code.map((digit, index) => (
            <input
              key={index}
              id={`code-${index}`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleChange(e as any, index)}
              className="w-11 h-11 text-xl text-center border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-secondary transition"
            />
          ))}
        </div>

        <button
          onClick={verifyEmail}
          disabled={loading}
          className="w-full py-3 bg-primary-secondary text-white font-semibold rounded-lg hover:bg-buttonHover transition duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? "Verifying..." : "Verify Account"}
        </button>

        <p className="text-center text-gray-600 mt-4">
          Didn't receive the code?{" "}
          <button
            className="text-primary-secondary hover:underline font-medium"
            onClick={handleResend}
          >
            Resend
          </button>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
