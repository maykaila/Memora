"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Library, Users, Brain, Menu, GraduationCap } from "lucide-react";
import { auth } from "../../../initializeFirebase"; 
import styles from "../LISidebarHeader.module.css";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function DashboardSidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [consecutiveDays, setConsecutiveDays] = useState(0); // This is the raw data from DB

  // --- LOGIC UPDATE ---
  // The backend counts raw days (1, 2, 3).
  // We only unlock the "Streak" status if they have 3+ days.
  // The "Visual Count" starts at 1 on Day 3.
  const isStreakUnlocked = consecutiveDays >= 3;
  
  // If consecutive days is 3, display 1. If 4, display 2.
  const displayStreak = isStreakUnlocked ? consecutiveDays - 2 : 0;
  // --------------------

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const response = await fetch(`https://memora-api.dcism.org/api/users/${user.uid}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.ok) {
            const data = await response.json();
            // Store the raw "Days Logged In" from the backend
            setConsecutiveDays(data.currentStreak || 0);
          }
        } catch (error) {
          console.error("Failed to fetch streak:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

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
        {/* ... (Your existing links for Home, Library, Classes) ... */}
        <Link
          href="/dashboard"
          className={`${styles.navItem} ${isActive("/dashboard") ? styles.navItemActive : ""}`}
        >
          <Home size={18} />
          <span className={styles.navLabel}>Home</span>
        </Link>

        <Link
            href="/library"
            className={`${styles.navItem} ${isActive("/library") ? styles.navItemActive : ""}`}
        >
            <Library size={18} />
            <span className={styles.navLabel}>Library</span>
        </Link>

        <Link
            href="/student-classes"
            className={`${styles.navItem} ${isActive("/student-classes") ? styles.navItemActive : ""}`}
        >
            <GraduationCap size={18} />
            <span className={styles.navLabel}>Classes</span>
        </Link>
      </nav>

      {/* Streak / footer */}
      <div className={styles.sidebarFooter}>
        {/* Show hint if NOT unlocked yet */}
        {!isStreakUnlocked && (
          <p className={`${styles.sidebarHint} ${styles.hideWhenCollapsed}`}>
            Use MEMORA for 3 days to unlock streak.
          </p>
        )}

        <div className={styles.streakBox}>
          {/* Icon turns Pink only when unlocked */}
          <Brain 
            size={18} 
            color={isStreakUnlocked ? "#ff69b4" : "currentColor"} 
            fill={isStreakUnlocked ? "#ff69b4" : "none"}
          />
          
          <span
            className={`${styles.navLabel} ${styles.hideWhenCollapsed}`}
            style={{ 
              fontWeight: isStreakUnlocked ? 'bold' : 'normal',
              color: isStreakUnlocked ? '#ff69b4' : 'inherit', 
            }}
          >
            {displayStreak} Streak
          </span>
        </div>
      </div>
    </aside>
  );
}