"use client";

import { useState } from "react";
// Use relative paths if your tsconfig aliases aren't set up for these yet
import TeacherSidebar from "../components/teacher/TeacherSidebar";
import LoggedInHeader from "../components/LoggedInHeader"; 
import styles from "../components/LISidebarHeader.module.css";
import { useRoleProtection } from "../hooks/useRoleProtection"; // Import the hook

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  // 1. Activate the Security Guard for TEACHERS
  const { isLoading, isAuthorized } = useRoleProtection("teacher");

  if (isLoading) {
    return <div style={{display:'flex', justifyContent:'center', marginTop:'50px'}}>Loading Teacher Profile...</div>;
  }

  if (!isAuthorized) return null;

  return (
    <div className={`${styles.dashboardWrapper} ${collapsed ? styles.dashboardCollapsed : ""}`}>
      <TeacherSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      
      <div className={styles.dashboardMain}>
        {/* CRITICAL: This tells the Header to use Teacher links */}
        <LoggedInHeader role="teacher" />
        <main>
            {children}
        </main>
      </div>
    </div>
  );
}