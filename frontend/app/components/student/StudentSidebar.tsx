"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Library, Users, Brain, Menu, GraduationCap } from "lucide-react"; // Added GraduationCap
import styles from "../LISidebarHeader.module.css";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function DashboardSidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside
      className={`${styles.sidebar} ${
        collapsed ? styles.sidebarCollapsed : ""
      }`}
    >
      {/* Top menu / toggle */}
      <div className={styles.sidebarTop}>
        <button
          className={styles.menuButton}
          aria-label="Toggle sidebar"
          onClick={onToggle}
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Nav items */}
      <nav className={styles.nav}>
        <Link
          href="/dashboard"
          className={`${styles.navItem} ${
            isActive("/dashboard") ? styles.navItemActive : ""
          }`}
        >
          <Home size={18} />
          <span className={styles.navLabel}>Home</span>
        </Link>

        <Link
          href="/library"
          className={`${styles.navItem} ${
            isActive("/library") ? styles.navItemActive : ""
          }`}
        >
          <Library size={18} />
          <span className={styles.navLabel}>Library</span>
        </Link>

        {/* NEW: Classes Link */}
        <Link
          href="/student-classes" 
          className={`${styles.navItem} ${
            isActive("/student-classes") ? styles.navItemActive : ""
          }`}
        >
          <GraduationCap size={18} /> 
          <span className={styles.navLabel}>Classes</span>
        </Link>

        {/* Join Class Action */}
        {/* <Link
          href="/join-class" 
          className={`${styles.navItem} ${
            isActive("/join-class") ? styles.navItemActive : ""
          }`}
        >
          <Users size={18} /> 
          <span className={styles.navLabel}>Join Class</span>
        </Link> */}
      </nav>

      {/* Streak / footer */}
      <div className={styles.sidebarFooter}>
        <p
          className={`${styles.sidebarHint} ${styles.hideWhenCollapsed}`}
        >
          Use MEMORA for 3 days to unlock streak.
        </p>
        <div className={styles.streakBox}>
          <Brain size={18} />
          <span
            className={`${styles.navLabel} ${styles.hideWhenCollapsed}`}
          >
            0 Streak
          </span>
        </div>
      </div>
    </aside>
  );
}