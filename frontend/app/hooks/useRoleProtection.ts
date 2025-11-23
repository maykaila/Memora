"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../initializeFirebase"; // Adjust path if needed

export function useRoleProtection(requiredRole: "student" | "teacher") {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Not logged in? Go to login
        router.push("/login");
        return;
      }

      try {
        // Get the ID Token to authenticate with your backend
        const idToken = await user.getIdToken();

        // Ask your backend: "What role is this user?"
        // (Make sure your backend API is running!)
        const response = await fetch(`http://localhost:5261/api/users/${user.uid}`, {
          headers: {
             Authorization: `Bearer ${idToken}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          const userRole = data.role?.toLowerCase(); // "student" or "teacher"

          if (userRole === requiredRole) {
            setIsAuthorized(true);
          } else {
            // Wrong role? Kick them to their correct dashboard
            if (userRole === "teacher") router.push("/teacher-dashboard");
            else router.push("/dashboard");
          }
        } else {
          console.error("Failed to fetch role");
        }
      } catch (error) {
        console.error("Error checking role:", error);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, requiredRole]);

  return { isLoading, isAuthorized };
}