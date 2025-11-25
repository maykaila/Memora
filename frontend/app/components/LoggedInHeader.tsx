"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../../initializeFirebase"; 
import styles from "./LISidebarHeader.module.css";
// 1. Import the existing component (which is now a modal)
import FolderCreator from "./FolderCreator";

interface LoggedInHeaderProps {
  role?: "student" | "teacher";
}

export default function LoggedInHeader({ role = "student" }: LoggedInHeaderProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  
  // 2. State for the folder popup
  const [showFolderModal, setShowFolderModal] = useState(false);
  
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

  const goToFlashcard = () => {
    setAddOpen(false);
    if (role === "teacher") {
      router.push("/teacher-create");
    } else {
      router.push("/create");
    }
  };

  // 3. Update: Open Modal instead of redirecting
  const handleFolder = () => {
    setAddOpen(false);
    setShowFolderModal(true); 
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

  // Close dropdowns when clicking outside
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
    <>
      {/* 4. Render the Modal here */}
      <FolderCreator 
        isOpen={showFolderModal} 
        onClose={() => setShowFolderModal(false)} 
        onSuccess={() => {
            // Simple refresh to ensure the new folder shows up on the dashboard
            window.location.reload(); 
        }}
        role={role}
      />

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
          {/* PLUS BUTTON */}
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

          {/* PROFILE BUTTON */}
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
    </>
  );
}