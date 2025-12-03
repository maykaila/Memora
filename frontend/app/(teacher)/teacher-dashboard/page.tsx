"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../initializeFirebase";
import { Users, BookOpen, PlusCircle, GraduationCap, Folder, Hash } from "lucide-react"; 
import Link from "next/link"; 
import styles from "../../components/dashboardLayout.module.css"; 
import FolderCreator from "../../components/FolderCreator";
import CreateClassModal from "../../components/teacher/CreateClassModal"; // 1. Import the Modal

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

// Updated to match your C# Class Model
interface ClassItem {
  classId: string;
  className: string;
  classCode: string;
  studentIds: string[];
}

export default function TeacherDashboard() {
  const [mySets, setMySets] = useState<FlashcardSet[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal States
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false); // 2. Add Modal State

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

  // 3. Refactor Class Fetching to reusable function
  const fetchClassesData = useCallback(async (user: any) => {
    const idToken = await user.getIdToken();
    const classesResponse = await fetch('https://memora-api.dcism.org/api/classes/teaching', {
        headers: { 'Authorization': `Bearer ${idToken}` },
    });
    
    if (classesResponse.ok) {
        const classData = await classesResponse.json();
        setClasses(classData);
    } else {
        console.error("Failed to fetch classes");
        setClasses([]);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const idToken = await user.getIdToken();
          
          // 1. Fetch Decks
          const myResponse = await fetch('https://memora-api.dcism.org/api/flashcardsets/my-sets', {
            headers: { 'Authorization': `Bearer ${idToken}` },
          });
          if (myResponse.ok) {
            const data = await myResponse.json();
            data.sort((a: any, b: any) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
            setMySets(data);
          }

          // 2. Fetch Folders
          await fetchFoldersData(user);

          // 3. Fetch Classes (Using refactored function)
          await fetchClassesData(user);

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
  }, [router, fetchFoldersData, fetchClassesData]);

  const refreshFolders = async () => {
    if (auth.currentUser) {
      await fetchFoldersData(auth.currentUser);
    }
  };

  // 4. Refresh function for Classes
  const refreshClasses = async () => {
    if (auth.currentUser) {
        await fetchClassesData(auth.currentUser);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const renderClasses = () => {
    if (classes.length === 0) {
      return (
        <div className={styles.recentsGrid}>
           {/* Updated to Button opening Modal */}
           <button 
             onClick={() => setIsClassModalOpen(true)}
             className={styles.standardCard} 
             style={{ borderStyle: 'dashed', background: 'transparent', borderColor: '#4a1942', justifyContent: 'center', cursor: 'pointer', width: '100%' }}
           >
              <div className={`${styles.iconBox}`} style={{background: 'transparent', color: '#4a1942'}}>
                 <PlusCircle size={20} />
              </div>
              <div className={styles.cardTitle}>Add Your First Class</div>
           </button>
        </div>
      );
    }

    // LIMIT TO 3 ITEMS
    const visibleClasses = classes.slice(0, 3);

    return (
      <div className={styles.recentsGrid}>
        {visibleClasses.map((cls) => (
          <Link href={`/classes/${cls.classId}`} key={cls.classId} className={styles.standardCard}>
            <div className={`${styles.iconBox} ${styles.iconGreen}`}>
              <Users size={20} />
            </div>
            <div style={{ flex: 1, minWidth: 100 }}>
              <div className={styles.cardTitle} style={{ fontSize: '1.1rem' }} title={cls.className}>{cls.className}</div>
              
              <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div className={styles.cardMeta}>
                   {cls.studentIds?.length || 0} Students
                </div>

                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px',
                    marginTop: '4px',
                    fontSize: '0.85rem',
                    color: '#4a1942', 
                    fontWeight: 'bold',
                    backgroundColor: 'rgba(74, 25, 66, 0.05)',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    width: 'fit-content'
                }}>
                    <Hash size={14} /> 
                    <span>Code: {cls.classCode}</span>
                </div>

              </div>
            </div>
          </Link>
        ))}
        
        {/* Updated to Button opening Modal - Always shown as the last item */}
        <button 
            onClick={() => setIsClassModalOpen(true)}
            className={styles.standardCard} 
            style={{ borderStyle: 'dashed', background: 'transparent', borderColor: '#4a1942', cursor: 'pointer', width: '100%', textAlign: 'left' }}
        >
            <div className={`${styles.iconBox}`} style={{background: 'transparent', color: '#4a1942'}}>
               <PlusCircle size={20} />
            </div>
            <div className={styles.cardTitle}>Add Class</div>
        </button>
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
          <Link href={`/teacher-folder/${folder.folderId}`} key={folder.folderId} className={styles.standardCard}>
             <div className={styles.iconBox} style={{ backgroundColor: '#e0f2fe', color: '#4a1942' }}>
              <Folder size={20} />
            </div>
            {/* ADD minWidth: 100 here */}
            <div style={{ flex: 1, minWidth: 100 }}>
              <div className={styles.cardTitle} title={folder.title}>{folder.title}</div>
              <div className={styles.cardMeta}>{folder.itemCount} items</div>
            </div>
          </Link>
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
          <Link href={`/teacher-cardOverview?id=${set.setId}`} key={set.setId} className={styles.standardCard}>
            <div className={`${styles.iconBox} ${styles.iconPurple}`}>
              <BookOpen size={20} />
            </div>
            <div style={{ flex: 1, minWidth: 100 }}> 
              <div className={styles.cardTitle} title={set.title}>{set.title}</div>
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
      
      {/* Modals */}
      <FolderCreator 
        isOpen={isFolderModalOpen} 
        onClose={() => setIsFolderModalOpen(false)} 
        onSuccess={refreshFolders}
        role="teacher"
      />
      
      <CreateClassModal 
        isOpen={isClassModalOpen} 
        onClose={() => setIsClassModalOpen(false)} 
        onSuccess={refreshClasses} 
      />

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#4a1942', display:'flex', alignItems:'center', gap:'10px' }}>
          <GraduationCap size={32} /> Welcome, Professor.
        </h1>
      </div>

      <section className={styles.dashboardSection}>
        <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>My Folders</h2>
        </div>
        {isLoading ? <p className={styles.emptyText}>Loading...</p> : renderFolders()}
      </section>

      <section className={styles.dashboardSection}>
        <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Decks</h2>
        </div>
        {isLoading ? <p className={styles.emptyText}>Loading...</p> : renderRecents()}
      </section>

      <section className={styles.dashboardSection}>
        <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Active Classes</h2>
        </div>
        {isLoading ? <p className={styles.emptyText}>Loading...</p> : renderClasses()}
      </section>

    </div>
  );
}