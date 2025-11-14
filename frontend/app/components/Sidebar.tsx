"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Library, LayoutGrid, Brain, Menu } from "lucide-react";
import styles from "./LISidebarHeader.module.css";

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

        <Link
          href="/categories"
          className={`${styles.navItem} ${
            isActive("/categories") ? styles.navItemActive : ""
          }`}
        >
          <LayoutGrid size={18} />
          <span className={styles.navLabel}>Categories</span>
        </Link>
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
