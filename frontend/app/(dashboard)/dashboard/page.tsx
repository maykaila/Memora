"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../initializeFirebase";
import { BookOpen } from "lucide-react";
import styles from "./dashboardLayout.module.css";
// We need Link for the create button, in case it's not in your layout
import Link from "next/link"; 

interface FlashcardSet {
  setId: string;
  userId: string;
  title: string;
  description: string | null;
  visibility: boolean; // Or string, depending on your final model
  dateCreated: string; // Will come as an ISO date string
  tagIds: string[];
}

export default function DashboardPage() {
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Listen for auth changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is logged in, fetch their data
        try {
          const idToken = await user.getIdToken();
          
          // Call the endpoint you built to get the user's sets
          const response = await fetch('http://localhost:5261/api/flashcardsets/my-sets', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${idToken}`,
            },
          });

          if (!response.ok) {
            let errorMsg = 'Failed to fetch your decks.';
            try {
              const errData = await response.json();
              if(errData.message) errorMsg = errData.message;
            } catch (e) {}
            throw new Error(errorMsg);
          }

          const data: FlashcardSet[] = await response.json();
          // Sort by date, newest first (good for "recents")
          data.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
          
          setSets(data);
          setError(null);
        } catch (err: any) {
          setError(err.message);
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      } else {
        // No user, redirect to login
        router.push('/login');
      }
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, [router]); // router is a dependency for useEffect

  // Helper function to format the date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // --- This is the new render logic, using your styles ---

  // Helper function to render the "Recents" section
  const renderRecents = () => {
    // Use the first 6 sets for "Recents"
    const recentSets = sets.slice(0, 6);

    if (recentSets.length === 0) {
      return (
        <p className={styles.emptyText}>
          You don&apos;t have any recent decks yet. Use the + button to create
          your first flashcard set.
        </p>
      );
    }

    return (
      <div className={styles.recentsGrid}>
        {recentSets.map((set) => (
          <div key={set.setId} className={styles.recentCard}>
            <div className={styles.recentIcon}>
              <BookOpen size={20} />
            </div>
            <div>
              <div className={styles.recentTitle}>{set.title}</div>
              <div className={styles.recentMeta}>
                {/* We don't have item count yet, so let's show description */}
                {set.description || "No description"}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Helper function to render the "Library" section
  const renderLibrary = () => {
    // Use all sets for "Library"
    if (sets.length === 0) {
      return (
        <>
          <p className={styles.emptyText}>
            Your library is empty. Create a flashcard set or folder from the
            + menu to see it here.
          </p>
          <div className={styles.libraryGrid}>
            {/* subtle placeholder blocks just like the mock */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.libraryPlaceholder} />
            ))}
          </div>
        </>
      );
    }

    return (
      <div className={styles.libraryGrid}>
        {sets.map((set) => (
          <div key={set.setId} className={styles.libraryCard}>
            <div className={styles.recentTitle}>{set.title}</div>
            <div className={styles.recentMeta}>
              {/* We don't have item count, so show date */}
              Created: {formatDate(set.dateCreated)}
            </div>
          </div>
        ))}
      </div>
    );
  };


  return (
    <div className={styles.dashboardContent}>
      
      {/* Handle Global Error State */}
      {error && (
        <section className={styles.dashboardSection}>
           <p className={styles.emptyText} style={{ color: 'red' }}>
            Error: {error}
          </p>
        </section>
      )}

      {/* Recents */}
      <section className={styles.dashboardSection}>
        <h2 className={styles.sectionTitle}>Recents</h2>

        {isLoading ? (
          <p className={styles.emptyText}>Loading recent decks...</p>
        ) : (
          renderRecents()
        )}
      </section>

      {/* Library */}
      <section className={styles.dashboardSection}>
        <h2 className={styles.sectionTitle}>Library</h2>
        
        {isLoading ? (
          <p className={styles.emptyText}>Loading library...</p>
        ) : (
          renderLibrary()
        )}
      </section>
    </div>
  );
}