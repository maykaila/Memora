"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../initializeFirebase";

import DashboardSidebar from "../components/student/StudentSidebar";
import DashboardHeader from "../components/LoggedInHeader";
import styles from "../components/LISidebarHeader.module.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login");
      } else {
        setAuthed(true);
      }
      setChecking(false);
    });
    return () => unsub();
  }, [router]);

  if (checking || !authed) return null;

  const handleToggleSidebar = () => {
    setCollapsed((prev) => !prev);
  };

  return (
    <div
      className={`${styles.dashboardWrapper} ${
        collapsed ? styles.dashboardCollapsed : ""
      }`}
    >
      <DashboardSidebar
        collapsed={collapsed}
        onToggle={handleToggleSidebar}
      />
      <div className={styles.dashboardMain}>
        <DashboardHeader />
        <main className={styles.dashboardContent}>{children}</main>
      </div>
    </div>
  );
}
