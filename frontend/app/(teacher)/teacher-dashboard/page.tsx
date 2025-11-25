"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../initializeFirebase";
import { Users, BookOpen, PlusCircle, GraduationCap, Folder } from "lucide-react"; 
import Link from "next/link"; 
import styles from "../../components/dashboardLayout.module.css"; 
// IMPORT YOUR EXISTING COMPONENT
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
}

interface ClassItem {
  id: string;
  name: string;
  studentCount: number;
  deckCount: number;
}

export default function TeacherDashboard() {
  const [mySets, setMySets] = useState<FlashcardSet[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
          
          const myResponse = await fetch('http://localhost:5261/api/flashcardsets/my-sets', {
            headers: { 'Authorization': `Bearer ${idToken}` },
          });
          if (myResponse.ok) {
            const data = await myResponse.json();
            data.sort((a: any, b: any) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
            setMySets(data);
          }

          await fetchFoldersData(user);

          setClasses([
            { id: '1', name: 'Biology 101 - Period 1', studentCount: 24, deckCount: 3 },
            { id: '2', name: 'Adv. Chemistry', studentCount: 18, deckCount: 5 },
            { id: '3', name: 'Homeroom', studentCount: 30, deckCount: 0 },
          ]);

        } catch (err) {
          console.error("Teacher Dashboard Load Error:", err);
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

  const renderClasses = () => {
    if (classes.length === 0) return <div className={styles.emptyText}>No active classes.</div>;

    return (
      <div className={styles.recentsGrid}>
        {classes.map((cls) => (
          <Link href={`/classes/${cls.id}`} key={cls.id} className={styles.standardCard}>
            <div className={`${styles.iconBox} ${styles.iconGreen}`}>
              <Users size={20} />
            </div>
            <div>
              <div className={styles.cardTitle}>{cls.name}</div>
              <div className={styles.cardMeta}>
                  {cls.studentCount} Students • {cls.deckCount} Decks
              </div>
            </div>
          </Link>
        ))}
        <Link href="/classes" className={styles.standardCard} style={{ borderStyle: 'dashed', background: 'transparent', borderColor: '#4a1942' }}>
            <div className={`${styles.iconBox}`} style={{background: 'transparent', color: '#4a1942'}}>
               <PlusCircle size={20} />
            </div>
            <div className={styles.cardTitle}>Add Class</div>
        </Link>
      </div>
    );
  };

  const renderFolders = () => {
    if (folders.length === 0) {
        return (
            <div className={styles.emptyText}>
                No folders. 
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
             <div className={styles.iconBox} style={{ backgroundColor: '#e0f2fe', color: '#4a1942' }}>
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

  const renderRecents = () => {
    const recentSets = mySets.slice(0, 6);
    if (recentSets.length === 0) return <div className={styles.emptyText}>No recent decks.</div>;
    
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
                <span style={{marginLeft: '4px'}}>{formatDate(set.dateCreated)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.dashboardContent}>
      
      {/* Modal for Teacher */}
      <FolderCreator 
        isOpen={isFolderModalOpen} 
        onClose={() => setIsFolderModalOpen(false)} 
        onSuccess={refreshFolders}
        role="teacher"
      />

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#4a1942', display:'flex', alignItems:'center', gap:'10px' }}>
          <GraduationCap size={32} /> Welcome, Professor.
        </h1>
      </div>

      <section className={styles.dashboardSection}>
        <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Active Classes</h2>
            <Link href="/classes" className={styles.actionLink}>Manage Classes</Link>
        </div>
        {isLoading ? <p className={styles.emptyText}>Loading...</p> : renderClasses()}
      </section>

      <section className={styles.dashboardSection}>
        <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>My Folders</h2>
            <button 
              onClick={() => setIsFolderModalOpen(true)}
              className={styles.actionLink}
              style={{background:'transparent', border:'none', cursor:'pointer'}}
            >
              + New Folder
            </button>
        </div>
        {isLoading ? <p className={styles.emptyText}>Loading...</p> : renderFolders()}
      </section>

      <section className={styles.dashboardSection}>
        <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Decks</h2>
            <Link href="/teacher-create" className={styles.actionLink}>+ New Deck</Link>
        </div>
        {isLoading ? <p className={styles.emptyText}>Loading...</p> : renderRecents()}
      </section>

    </div>
  );
}