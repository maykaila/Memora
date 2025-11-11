"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, User } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../../initializeFirebase"; // adjust path if needed
import styles from "./LISidebarHeader.module.css";

export default function LoggedInHeader() {
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

  const goToFlashcard = () => {
    setAddOpen(false);
    router.push("/create-flashcard");
  };

  const handleFolder = () => {
    setAddOpen(false);
    // TODO: route to create-folder page when ready
    console.log("Folder clicked");
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

  // Close any open menu when clicking outside
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
      {/* Search */}
      <div className={styles.searchWrapper}>
        <Search size={18} />
        <input
          type="text"
          placeholder="Search for titles, authors, categories..."
          className={styles.searchInput}
        />
      </div>

      {/* Actions (Plus + Profile) */}
      <div className={styles.headerActions} ref={menuRef}>
        {/* Plus button + menu */}
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

        {/* Profile button + logout menu */}
        <div style={{ position: "relative" }}>
          <button
            type="button"
            className={styles.userButton}
            onClick={toggleProfileMenu}
            aria-haspopup="true"
            aria-expanded={profileOpen}
          >
            {/* Replace "A" with actual initial if you store displayName/email */}
            <span className={styles.userInitial}>A</span>
          </button>

          {profileOpen && (
            <div className={styles.profileMenu}>
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
