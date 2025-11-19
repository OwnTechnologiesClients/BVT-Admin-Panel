"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, loading, user, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Redirect to login if not authenticated
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }

      // Check role-based access if allowedRoles is specified
      if (allowedRoles.length > 0 && role && !allowedRoles.includes(role)) {
        // Redirect to appropriate dashboard based on role
        if (role === "instructor") {
          router.push("/instructor");
        } else {
          router.push("/");
        }
        return;
      }
    }
  }, [isAuthenticated, loading, role, allowedRoles, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!isAuthenticated || (allowedRoles.length > 0 && role && !allowedRoles.includes(role))) {
    return null;
  }

  return <>{children}</>;
}

