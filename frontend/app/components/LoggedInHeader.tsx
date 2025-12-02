"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus } from "lucide-react";
import { signOut, onAuthStateChanged } from "firebase/auth"; // Added onAuthStateChanged
import { auth } from "../../initializeFirebase"; 
import styles from "./LISidebarHeader.module.css";

import FolderCreator from "./FolderCreator";
import ProfileSettings from "./profilesettings"; 

interface LoggedInHeaderProps {
  role?: "student" | "teacher";
}

export default function LoggedInHeader({ role = "student" }: LoggedInHeaderProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  
  // Modal states
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // NEW: State for the user's initial
  const [userInitial, setUserInitial] = useState("U");

  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);

  // NEW: Listen for Auth Changes to update the Initial
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Priority: Display Name -> Email -> "U"
        const name = user.displayName || user.email || "User";
        // Get first letter and make it uppercase
        setUserInitial(name.charAt(0).toUpperCase());
      } else {
        setUserInitial("U");
      }
    });
    return () => unsubscribe();
  }, []);

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

  const handleFolder = () => {
    setAddOpen(false);
    setShowFolderModal(true); 
  };

  const handleProfileClick = () => {
    setProfileOpen(false); 
    setShowProfileModal(true); 
  };

  // When closing the profile modal, update the initial in case they changed their name
  const handleCloseProfileModal = () => {
    setShowProfileModal(false);
    if (auth.currentUser) {
        const name = auth.currentUser.displayName || auth.currentUser.email || "User";
        setUserInitial(name.charAt(0).toUpperCase());
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setProfileOpen(false);
      setShowProfileModal(false); 
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
      {/* Existing Folder Creator Modal */}
      <FolderCreator 
        isOpen={showFolderModal} 
        onClose={() => setShowFolderModal(false)} 
        onSuccess={() => {
           window.location.reload(); 
        }}
        role={role}
      />

      {/* Profile Settings Modal */}
      <ProfileSettings 
        isOpen={showProfileModal}
        onClose={handleCloseProfileModal} // Use custom close handler to refresh initial
      />

      <header className={styles.header}>
        {/* <div className={styles.searchWrapper}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search for titles, authors, categories..."
            className={styles.searchInput}
          />
        </div> */}

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
              {/* UPDATED: Dynamic User Initial */}
              <span className={styles.userInitial}>{userInitial}</span>
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