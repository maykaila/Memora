"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Library, GraduationCap, BarChart, Menu, PlusCircle } from "lucide-react";
// We use .. to go up to 'components' folder to find the CSS
import styles from "../LISidebarHeader.module.css";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function TeacherSidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside
      className={`${styles.sidebar} ${
        collapsed ? styles.sidebarCollapsed : ""
      }`}
    >
      <div className={styles.sidebarTop}>
        <button
          className={styles.menuButton}
          aria-label="Toggle sidebar"
          onClick={onToggle}
        >
          <Menu size={22} />
        </button>
      </div>

      <nav className={styles.nav}>
        <Link
          href="/teacher-dashboard"
          className={`${styles.navItem} ${
            isActive("/teacher-dashboard") ? styles.navItemActive : ""
          }`}
        >
          <Home size={18} />
          <span className={styles.navLabel}>Dashboard</span>
        </Link>

        <Link
          href="/classes"
          className={`${styles.navItem} ${
            isActive("/classes") ? styles.navItemActive : ""
          }`}
        >
          <GraduationCap size={18} />
          <span className={styles.navLabel}>My Classes</span>
        </Link>

        <Link
          href="/teacher-library"
          className={`${styles.navItem} ${
            isActive("/teacher-library") ? styles.navItemActive : ""
          }`}
        >
          <Library size={18} />
          <span className={styles.navLabel}>Library</span>
        </Link>

        {/* <Link
          href="/teacher-create"
          className={`${styles.navItem} ${
            isActive("/teacher-create") ? styles.navItemActive : ""
          }`}
        >
          <PlusCircle size={18} />
          <span className={styles.navLabel}>Create Deck</span>
        </Link> */}

        {/* <Link
          href="/analytics"
          className={`${styles.navItem} ${
            isActive("/analytics") ? styles.navItemActive : ""
          }`}
        >
          <BarChart size={18} />
          <span className={styles.navLabel}>Analytics</span>
        </Link> */}
      </nav>

      <div className={styles.sidebarFooter}>
        <p className={`${styles.sidebarHint} ${styles.hideWhenCollapsed}`}>
           Teacher Mode
        </p>
        <div className={styles.streakBox}>
          <span className={`${styles.navLabel} ${styles.hideWhenCollapsed}`}>
            Active Term
          </span>
        </div>
      </div>
    </aside>
  );
}