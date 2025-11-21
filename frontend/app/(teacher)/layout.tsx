"use client";

import { useState } from "react";
import TeacherSidebar from "../components/teacher/TeacherSidebar";
// Assuming you have the shared Header available
import LoggedInHeader from "../components/LoggedInHeader"; 
import styles from "../components/LISidebarHeader.module.css";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`${styles.dashboardWrapper} ${collapsed ? styles.dashboardCollapsed : ""}`}>
      {/* Teacher Sidebar */}
      <TeacherSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      
      <div className={styles.dashboardMain}>
        {/* Shared Header */}
        <LoggedInHeader />
        <main>
            {children}
        </main>
      </div>
    </div>
  );
}