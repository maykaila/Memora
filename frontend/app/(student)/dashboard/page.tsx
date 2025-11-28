"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../initializeFirebase";
import { BookOpen, Globe, Lock, Folder, GraduationCap } from "lucide-react"; 
import Link from "next/link"; 
import styles from "../../components/dashboardLayout.module.css"; 
// IMPORT YOUR EXISTING COMPONENT (Now acting as a modal)
import FolderCreator from "../../components/FolderCreator";

interface FlashcardSet {
  setId: string;
  userId: string;
  title: string;
  description: string | null;
  visibility: boolean | string; 
  dateCreated: string;
}

interface FolderItem {
  folderId: string;
  title: string;
  itemCount: number;
  color?: string;
  Color?: string;
}

export default function StudentDashboard() {
  const [mySets, setMySets] = useState<FlashcardSet[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]); 
  const [publicSets, setPublicSets] = useState<FlashcardSet[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false); 
  const router = useRouter();

  const fetchFoldersData = useCallback(async (user: any) => {
    const idToken = await user.getIdToken();
    const folderResponse = await fetch('http://localhost:5261/api/folders/my-folders', {
      headers: { 'Authorization': `Bearer ${idToken}` },
    });
    if (folderResponse.ok) {
      setFolders(await folderResponse.json());
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const idToken = await user.getIdToken();
          
          await fetch('http://localhost:5261/api/users/checkin', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${idToken}` },
          });

          const myResponse = await fetch('http://localhost:5261/api/flashcardsets/my-sets', {
            headers: { 'Authorization': `Bearer ${idToken}` },
          });
          if (!myResponse.ok) throw new Error("Failed to load decks");
          const myData = await myResponse.json();
          myData.sort((a: any, b: any) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
          setMySets(myData);

          await fetchFoldersData(user);

          const publicResponse = await fetch('http://localhost:5261/api/flashcardsets', { 
            headers: { 'Authorization': `Bearer ${idToken}` },
          });
          if (publicResponse.ok) {
            setPublicSets(await publicResponse.json());
          }
          
          setError(null);
        } catch (err: any) {
          console.error("Dashboard Load Error:", err);
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router, fetchFoldersData]);

  const refreshFolders = async () => {
    if (auth.currentUser) {
      await fetchFoldersData(auth.currentUser);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const renderRecents = () => {
    const recentSets = mySets.slice(0, 6);
    if (recentSets.length === 0) return <div className={styles.emptyText}>You don&apos;t have any recent decks yet.</div>;
    return (
      <div className={styles.recentsGrid}>
        {recentSets.map((set) => (
          <Link href={`/overviewOfCards?id=${set.setId}`} key={set.setId} className={styles.standardCard}>
            <div className={`${styles.iconBox} ${styles.iconPurple}`}>
              <BookOpen size={20} />
            </div>
            <div>
              <div className={styles.cardTitle}>{set.title}</div>
              <div className={styles.cardMeta}>
                {(set.visibility === true || String(set.visibility).toLowerCase() === "public") ? <Globe size={12}/> : <Lock size={12}/>} 
                <span style={{marginLeft: '4px'}}>{formatDate(set.dateCreated)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  const renderFolders = () => {
    if (folders.length === 0) {
        return (
            <div className={styles.emptyText}>
                You don&apos;t have any folders yet. 
                <button 
                  onClick={() => setIsFolderModalOpen(true)} 
                  style={{background:'none', border:'none', marginLeft: '5px', textDecoration:'underline', color: '#4a1942', cursor:'pointer', font:'inherit'}}
                >
                    Create one?
                </button>
            </div>
        );
    }

    return (
      <div className={styles.recentsGrid}>
        {folders.map((folder) => (
          <div key={folder.folderId} className={styles.standardCard}>
            <div 
                className={styles.iconBox} 
                style={{ 
                    // Kept logic in case old data has colors, but defaults to blue
                    backgroundColor: folder.color || folder.Color || '#e0f2fe', 
                    color: '#4a1942' 
                }}
            >
              <Folder size={20} />
            </div>
            <div>
              <div className={styles.cardTitle}>{folder.title}</div>
              <div className={styles.cardMeta}>{folder.itemCount} items</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderExplore = () => {
    if (publicSets.length === 0) return <div className={styles.emptyText}>No public decks found.</div>;
    return (
      <div className={styles.exploreGrid}>
        {publicSets.map((set) => (
          <Link href={`/overviewOfCards?id=${set.setId}`} key={set.setId} className={styles.exploreCard}>
            <div className={styles.exploreTitle}>{set.title}</div>
            <div className={styles.exploreMeta}>Public Deck • {formatDate(set.dateCreated)}</div>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.dashboardContent}>
      {error && <p className={styles.emptyText} style={{ color: 'red' }}>Error: {error}</p>}

      {/* USE EXISTING FOLDER CREATOR AS MODAL */}
      <FolderCreator 
        isOpen={isFolderModalOpen} 
        onClose={() => setIsFolderModalOpen(false)} 
        onSuccess={refreshFolders}
        role="student"
      />

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#4a1942', display:'flex', alignItems:'center', gap:'10px' }}>
          <GraduationCap size={32} /> Welcome, Student.
        </h1>
      </div>

      <section className={styles.dashboardSection}>
        <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recents</h2>
            {/* <Link href="/create" className={styles.actionLink}>+ New Deck</Link> */}
        </div>
        {isLoading ? <p className={styles.emptyText}>Loading...</p> : renderRecents()}
      </section>

      <section className={styles.dashboardSection}>
        <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Folders</h2>
            {/* <button 
              onClick={() => setIsFolderModalOpen(true)} 
              className={styles.actionLink}
              style={{background:'transparent', border:'none', cursor:'pointer'}}
            >
              + New Folder
            </button> */}
        </div>
        {isLoading ? <p className={styles.emptyText}>Loading...</p> : renderFolders()}
      </section>

      <section className={styles.dashboardSection}>
        <h2 className={styles.sectionTitle}>Explore</h2>
        {isLoading ? <p className={styles.emptyText}>Loading...</p> : renderExplore()}
      </section>
    </div>
  );
}