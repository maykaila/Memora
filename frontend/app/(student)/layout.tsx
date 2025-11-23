"use client";

import { useState } from "react";
// We don't need useRouter or onAuthStateChanged here anymore 
// because the hook handles it all!

import DashboardSidebar from "../components/student/StudentSidebar";
import DashboardHeader from "../components/LoggedInHeader";
import styles from "../components/LISidebarHeader.module.css";
import { useRoleProtection } from "../hooks/useRoleProtection"; // Import the security hook

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  // 1. Activate Security: Check if user is logged in AND is a student
  const { isLoading, isAuthorized } = useRoleProtection("student");

  // 2. Show loading state while checking
  if (isLoading) {
    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh', 
            color: '#4a1942' 
        }}>
            Loading Student Dashboard...
        </div>
    );
  }

  // 3. If not authorized (e.g., not logged in, or is a Teacher), hide content
  // The hook will automatically redirect them, so we just return null here.
  if (!isAuthorized) return null;

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
        {/* CRITICAL FIX: Pass role="student" here! */}
        <DashboardHeader role="student" />
        
        {/* Note: I changed your className slightly to match the CSS file provided earlier, 
            but kept your structure. Verify 'dashboardContent' exists in your CSS or remove the class. */}
        <main>{children}</main>
      </div>
    </div>
  );
}