"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, User } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../../initializeFirebase"; 
import styles from "./LISidebarHeader.module.css";

// 1. Define the interface for props
interface LoggedInHeaderProps {
  role?: "student" | "teacher"; // Optional prop
}

// 2. Accept the prop (default to 'student' if missing)
export default function LoggedInHeader({ role = "student" }: LoggedInHeaderProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);

  const toggleAddMenu = () => {
    setAddOpen((prev) => !prev);
    setProfileOpen(false);
  };

  const toggleProfileMenu = () => {
    setProfileOpen((prev) => !prev);
    setAddOpen(false);
  };

  // 3. Update the routing logic based on the role
  const goToFlashcard = () => {
    setAddOpen(false);
    if (role === "teacher") {
      router.push("/teacher-create");
    } else {
      router.push("/create");
    }
  };

  const handleFolder = () => {
    setAddOpen(false);
    console.log("Folder clicked");
  };

  const handleProfileClick = () => {
    setProfileOpen(false);
    router.push("/profile-settings");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setProfileOpen(false);
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) {
        setAddOpen(false);
        setProfileOpen(false);
      }
    };

    if (addOpen || profileOpen) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [addOpen, profileOpen]);

  return (
    <header className={styles.header}>
      <div className={styles.searchWrapper}>
        <Search size={18} />
        <input
          type="text"
          placeholder="Search for titles, authors, categories..."
          className={styles.searchInput}
        />
      </div>

      <div className={styles.headerActions} ref={menuRef}>
        <div style={{ position: "relative" }}>
          <button
            type="button"
            className={styles.plusButton}
            onClick={toggleAddMenu}
            aria-haspopup="true"
            aria-expanded={addOpen}
          >
            <Plus size={20} />
          </button>

          {addOpen && (
            <div className={styles.addMenu}>
              <button
                type="button"
                className={styles.addMenuItem}
                onClick={goToFlashcard}
              >
                Flashcard
              </button>
              <div className={styles.addMenuDivider} />
              <button
                type="button"
                className={styles.addMenuItem}
                onClick={handleFolder}
              >
                Folder
              </button>
            </div>
          )}
        </div>

        <div style={{ position: "relative" }}>
          <button
            type="button"
            className={styles.userButton}
            onClick={toggleProfileMenu}
            aria-haspopup="true"
            aria-expanded={profileOpen}
          >
            <span className={styles.userInitial}>A</span>
          </button>

          {profileOpen && (
            <div className={styles.profileMenu}>
              <button
                type="button"
                className={styles.profileMenuItem}
                onClick={handleProfileClick}
              >
                Profile
              </button>
              <button
                type="button"
                className={styles.profileMenuItem}
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}