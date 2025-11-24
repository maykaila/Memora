"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../initializeFirebase";
import { BookOpen, Globe, Lock, Folder } from "lucide-react"; 
import styles from "./dashboardLayout.module.css";
import Link from "next/link"; 

interface FlashcardSet {
  setId: string;
  userId: string;
  title: string;
  description: string | null;
  visibility: boolean; // or string depending on your backend serialization
  dateCreated: string;
  tagIds: string[];
}

// Updated to match your C# Backend Model
interface FolderItem {
  folderId: string; // Changed from 'id' to match backend
  title: string;
  description: string | null;
  itemCount: number; // Matches the 'ItemCount' property in C#
}

export default function DashboardPage() {
  const [mySets, setMySets] = useState<FlashcardSet[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]); 
  const [publicSets, setPublicSets] = useState<FlashcardSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const idToken = await user.getIdToken();
          
          // 0. Streak Check-in
          await fetch('http://localhost:5261/api/users/checkin', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${idToken}` },
          });

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

          // 2. Fetch My Folders (NEW)
          const folderResponse = await fetch('http://localhost:5261/api/folders/my-folders', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${idToken}` },
          });

          if (folderResponse.ok) {
            const folderData: FolderItem[] = await folderResponse.json();
            setFolders(folderData);
          } else {
            console.error("Failed to fetch folders");
          }

          // 3. Fetch Public Sets
          const publicResponse = await fetch('http://localhost:5261/api/flashcardsets', { 
            method: 'GET',
            headers: { 'Authorization': `Bearer ${idToken}` },
          });

          if (publicResponse.ok) {
            const publicData: FlashcardSet[] = await publicResponse.json();
            setPublicSets(publicData);
          }

          // Sort sets by date
          myData.sort((a: any, b: any) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
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
                  {/* Check if visibility is string ("Public") or bool (true) based on your backend implementation */}
                  {(set.visibility === true || String(set.visibility).toLowerCase() === "public") ? <Globe size={12}/> : <Lock size={12}/>} 
                  <span style={{marginLeft: 5}}>{set.description || "No description"}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  // --- Render Folders ---
  const renderFolders = () => {
    if (folders.length === 0) {
      return (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>
            You don&apos;t have any folders yet. 
          </p>
          <Link href="/dashboard/create-folder" style={{ textDecoration: 'none' }}>
             <span style={{ fontSize: '0.9rem', color: '#6a4063', fontWeight: '600', cursor: 'pointer' }}>Create a folder</span>
          </Link>
        </div>
      );
    }

    return (
      <div className={styles.recentsGrid}> 
        {folders.map((folder) => (
          // You can link this to a folder view page later e.g. /folder?id=...
          <div key={folder.folderId} className={styles.recentCard}>
            <div className={styles.recentIcon} style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
              <Folder size={20} />
            </div>
            <div>
              <div className={styles.recentTitle}>{folder.title}</div>
              <div className={styles.recentMeta}>
                {folder.itemCount} decks
              </div>
            </div>
          </div>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>Recents</h2>
            {/* <Link href="/dashboard/create-flashcard" style={{ textDecoration: 'none', fontSize: '0.9rem', color: '#4a1942', fontWeight: 'bold' }}>
                + New Deck
            </Link> */}
        </div>
        {isLoading ? <p className={styles.emptyText}>Loading...</p> : renderRecents()}
      </section>

      <section className={styles.dashboardSection}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>Folders</h2>
            {/* <Link href="/dashboard/create-folder" style={{ textDecoration: 'none', fontSize: '0.9rem', color: '#4a1942', fontWeight: 'bold' }}>
                + New Folder
            </Link> */}
        </div>
        {isLoading ? <p className={styles.emptyText}>Loading...</p> : renderFolders()}
      </section>

      <section className={styles.dashboardSection}>
        <h2 className={styles.sectionTitle}>Explore</h2>
        {isLoading ? <p className={styles.emptyText}>Loading...</p> : renderLibrary()}
      </section>
    </div>
  );
}