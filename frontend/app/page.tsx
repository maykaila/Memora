"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../initializeFirebase"; // adjust path if needed
import { onAuthStateChanged } from "firebase/auth";

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const off = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/dashboard"); // already logged in → skip landing
      } else {
        setChecking(false);
      }
    });
    return () => off();
  }, [router]);

  if (checking) return null; // or a spinner

  return (
    <div className="mainPage">
      <h2>Main Page</h2>  
    </div>
  );
}
