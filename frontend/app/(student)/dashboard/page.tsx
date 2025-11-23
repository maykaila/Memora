"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../initializeFirebase";
import { BookOpen, Globe, Lock } from "lucide-react"; 
import styles from "./dashboardLayout.module.css";
import Link from "next/link"; 

interface FlashcardSet {
  setId: string;
  userId: string;
  title: string;
  description: string | null;
  visibility: boolean;
  dateCreated: string;
  tagIds: string[];
}

export default function DashboardPage() {
  const [mySets, setMySets] = useState<FlashcardSet[]>([]);
  const [publicSets, setPublicSets] = useState<FlashcardSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const idToken = await user.getIdToken();
          
          // 1. Fetch My Sets
          const myResponse = await fetch('http://localhost:5261/api/flashcardsets/my-sets', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${idToken}` },
          });

          if (!myResponse.ok) {
            const text = await myResponse.text();
            console.error("My Sets API Error:", myResponse.status, text);
            throw new Error(`Failed to load your decks: ${myResponse.statusText}`);
          }
          const myData: FlashcardSet[] = await myResponse.json();

          // 2. Fetch Public Sets
          const publicResponse = await fetch('http://localhost:5261/api/flashcardsets', { 
            method: 'GET',
            headers: { 'Authorization': `Bearer ${idToken}` },
          });

          if (!publicResponse.ok) {
             const text = await publicResponse.text();
             console.error("Public Library API Error:", publicResponse.status, text);
             setPublicSets([]);
          } else {
            const publicData: FlashcardSet[] = await publicResponse.json();
            setPublicSets(publicData);
          }

          // Sort by date
          myData.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
          setMySets(myData);
          setError(null);
        } catch (err: any) {
          setError(err.message);
          console.error("Dashboard Fetch Error:", err);
        } finally {
          setIsLoading(false);
        }
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  // --- Render Recents ---
  const renderRecents = () => {
    const recentSets = mySets.slice(0, 6);

    if (recentSets.length === 0) {
      return (
        <p className={styles.emptyText}>
          You don&apos;t have any recent decks yet. Use the + button to create one.
        </p>
      );
    }

    return (
      <div className={styles.recentsGrid}>
        {recentSets.map((set) => (
          // WRAPPED IN LINK: Points to the new overview page with the Set ID
          <Link 
            href={`/overviewOfCards?id=${set.setId}`} 
            key={set.setId} 
            style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
          >
            <div className={styles.recentCard}>
              <div className={styles.recentIcon}>
                <BookOpen size={20} />
              </div>
              <div>
                <div className={styles.recentTitle}>{set.title}</div>
                <div className={styles.recentMeta}>
                  {set.visibility ? <Globe size={12}/> : <Lock size={12}/>} 
                  <span style={{marginLeft: 5}}>{set.description || "No description"}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  // --- Render Library ---
  const renderLibrary = () => {
    if (publicSets.length === 0) {
      return (
        <p className={styles.emptyText}>
          No public decks found in the community library.
        </p>
      );
    }

    return (
      <div className={styles.libraryGrid}>
        {publicSets.map((set) => (
          // WRAPPED IN LINK: Points to the same overview page
          <Link 
            href={`/overviewOfCards?id=${set.setId}`} 
            key={set.setId}
            style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
          >
            <div className={styles.libraryCard}>
              <div className={styles.recentTitle}>{set.title}</div>
              <div className={styles.recentMeta}>
                <span style={{fontWeight: 'bold', color: '#666'}}>Public Deck</span> • {formatDate(set.dateCreated)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.dashboardContent}>
      {error && <p className={styles.emptyText} style={{ color: 'red' }}>Error: {error}</p>}

      <section className={styles.dashboardSection}>
        <h2 className={styles.sectionTitle}>Recents</h2>
        {isLoading ? <p className={styles.emptyText}>Loading...</p> : renderRecents()}
      </section>

      <section className={styles.dashboardSection}>
        <h2 className={styles.sectionTitle}>Explore</h2>
        {isLoading ? <p className={styles.emptyText}>Loading...</p> : renderLibrary()}
      </section>
    </div>
  );
}