"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../initializeFirebase";
import { BookOpen, Globe, Lock, Folder, GraduationCap, ChevronLeft, ChevronRight } from "lucide-react"; 
import Link from "next/link"; 
import styles from "../../components/dashboardLayout.module.css"; 
import FolderCreator from "../../components/FolderCreator";

interface FlashcardSet {
  setId: string;
  userId: string;
  title: string;
  description: string | null;
  visibility: boolean | string; 
  dateCreated: string;
  createdBy?: string;
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
  
  // PAGINATION STATE FOR EXPLORE
  const [exploreOffset, setExploreOffset] = useState(0);
  const EXPLORE_PAGE_SIZE = 12; 
  
  // LIMITS FOR OTHER SECTIONS
  const RECENTS_LIMIT = 8; 
  const FOLDERS_LIMIT = 8; 

  const router = useRouter();

  const fetchFoldersData = useCallback(async (user: any) => {
    const idToken = await user.getIdToken();
    const folderResponse = await fetch('https://memora-api.dcism.org/api/folders/my-folders', {
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
          
          await fetch('https://memora-api.dcism.org/api/users/checkin', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${idToken}` },
          });

          const myResponse = await fetch('https://memora-api.dcism.org/api/flashcardsets/my-sets', {
            headers: { 'Authorization': `Bearer ${idToken}` },
          });
          if (!myResponse.ok) throw new Error("Failed to load decks");
          const myData = await myResponse.json();
          myData.sort((a: any, b: any) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
          setMySets(myData);

          await fetchFoldersData(user);

          const publicResponse = await fetch('https://memora-api.dcism.org/api/flashcardsets', { 
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

  // --- HANDLERS FOR PAGINATION ---
  const handleNextExplore = () => {
    if (exploreOffset + EXPLORE_PAGE_SIZE < publicSets.length) {
      setExploreOffset(prev => prev + EXPLORE_PAGE_SIZE);
    }
  };

  const handlePrevExplore = () => {
    if (exploreOffset > 0) {
      setExploreOffset(prev => Math.max(0, prev - EXPLORE_PAGE_SIZE));
    }
  };

  const renderRecents = () => {
    const recentSets = mySets.slice(0, RECENTS_LIMIT);
    
    if (recentSets.length === 0) return <div className={styles.emptyText}>You don&apos;t have any recent decks yet.</div>;
    return (
      <div className={styles.recentsGrid}>
        {recentSets.map((set) => (
          <Link href={`/overviewOfCards?id=${set.setId}`} key={set.setId} className={styles.standardCard}>
            <div className={`${styles.iconBox} ${styles.iconPurple}`}>
              <BookOpen size={20} />
            </div>
            
            {/* UPDATED CONTAINER */}
            <div style={{ flex: 1, minWidth: '100px' }}>
              <div className={styles.cardTitle} title={set.title}>{set.title}</div>
              <div className={styles.cardMeta}>
                {(set.visibility === true || String(set.visibility).toLowerCase() === "public") ? <Globe size={12}/> : <Lock size={12}/>} 
                <span style={{marginLeft: '4px'}}>{formatDate(set.dateCreated)}</span>
              </div>

              {set.createdBy && (
                <p style={{ fontSize: "12px", color: "#777", marginTop: "4px" }}>
                  Created by: <i>{set.createdBy}</i>
                </p>
              )}
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

    const visibleFolders = folders.slice(0, FOLDERS_LIMIT);

    return (
      <div className={styles.recentsGrid}>
        {visibleFolders.map((folder) => (
          <Link href={`/folder/${folder.folderId}`} key={folder.folderId} className={styles.standardCard}>
            <div 
                className={styles.iconBox} 
                style={{ 
                    backgroundColor: folder.color || folder.Color || '#e0f2fe', 
                    color: '#4a1942' 
                }}
            >
              <Folder size={20} />
            </div>
            
            {/* UPDATED CONTAINER */}
            <div style={{ flex: 1, minWidth: '100px' }}>
              <div className={styles.cardTitle} title={folder.title}>{folder.title}</div>
              <div className={styles.cardMeta}>{folder.itemCount} items</div>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  const renderExplore = () => {
    if (publicSets.length === 0) return <div className={styles.emptyText}>No public decks found.</div>;
    
    // PAGINATION LOGIC
    const visibleSets = publicSets.slice(exploreOffset, exploreOffset + EXPLORE_PAGE_SIZE);

    return (
      <div className={styles.exploreGrid}>
        {visibleSets.map((set) => (
          <Link href={`/overviewOfCards?id=${set.setId}`} key={set.setId} className={styles.exploreCard}>
            <div className={styles.exploreTitle}>{set.title}</div>
            <div className={styles.exploreMeta}>Public Deck • {formatDate(set.dateCreated)}</div>
            {set.createdBy && (
            <p className={styles.exploreMeta} style={{ marginTop: "4px" }}>
              Created by: <i>{set.createdBy}</i>
            </p>
          )}
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.dashboardContent}>
      {error && <p className={styles.emptyText} style={{ color: 'red' }}>Error: {error}</p>}

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
        </div>
        {isLoading ? <p className={styles.emptyText}>Loading...</p> : renderRecents()}
      </section>

      <section className={styles.dashboardSection}>
        <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Folders</h2>
        </div>
        {isLoading ? <p className={styles.emptyText}>Loading...</p> : renderFolders()}
      </section>

      <section className={styles.dashboardSection}>
        {/* EXPLORE HEADER WITH PAGINATION ARROWS */}
        <div className={styles.sectionHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className={styles.sectionTitle}>Explore</h2>
            
            {/* Arrows only show if there are enough items to paginate */}
            {publicSets.length > EXPLORE_PAGE_SIZE && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={handlePrevExplore} 
                  disabled={exploreOffset === 0}
                  style={{
                    background: exploreOffset === 0 ? '#eee' : 'white',
                    border: '1px solid #ddd',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: exploreOffset === 0 ? 'default' : 'pointer',
                    color: exploreOffset === 0 ? '#ccc' : '#4a1942'
                  }}
                >
                  <ChevronLeft size={18} />
                </button>
                <button 
                  onClick={handleNextExplore} 
                  disabled={exploreOffset + EXPLORE_PAGE_SIZE >= publicSets.length}
                  style={{
                    background: exploreOffset + EXPLORE_PAGE_SIZE >= publicSets.length ? '#eee' : 'white',
                    border: '1px solid #ddd',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: exploreOffset + EXPLORE_PAGE_SIZE >= publicSets.length ? 'default' : 'pointer',
                    color: exploreOffset + EXPLORE_PAGE_SIZE >= publicSets.length ? '#ccc' : '#4a1942'
                  }}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
        </div>
        {isLoading ? <p className={styles.emptyText}>Loading...</p> : renderExplore()}
      </section>
    </div>
  );
}