"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../initializeFirebase"; 
import { Users, Plus, Copy, BookOpen } from "lucide-react";
import styles from "./classes.module.css"; 
import CreateClassModal from "../../components/teacher/CreateClassModal"; 

// ... [Interface remains the same] ...
interface ClassItem {
  id?: string;
  Id?: string;
  classId?: string;
  ClassId?: string;

  name?: string;
  Name?: string;
  className?: string;
  ClassName?: string;
  
  code?: string;
  Code?: string;
  classCode?: string;
  ClassCode?: string;
  
  studentCount?: number;
  StudentCount?: number;
  studentIds?: string[];
  StudentIds?: string[];
  
  deckCount?: number;
  DeckCount?: number;
  assignmentIds?: string[];
  AssignmentIds?: string[];
}

export default function MyClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); 
  
  // --- NEW: Track which ID is currently "copied" ---
  const [copiedId, setCopiedId] = useState<string | null>(null);
  // -----------------------------------------------

  const router = useRouter();

  // ... [fetchClasses function remains the same] ...
  const fetchClasses = useCallback(async (user: any) => {
    const idToken = await user.getIdToken();
    const response = await fetch('http://localhost:5261/api/classes/teaching', {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}` 
      },
    });

    if (response.ok) {
      const data = await response.json();
      setClasses(data);
    } else {
      console.error("Failed to fetch classes");
    }
  }, []);

  // ... [useEffect hooks remain the same] ...
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          await fetchClasses(user);
        } catch (error) {
          console.error("Error loading classes:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router, fetchClasses]);

  useEffect(() => {
    const interval = setInterval(() => {
        if (auth.currentUser) {
            fetchClasses(auth.currentUser); 
        }
    }, 4000); 

    return () => clearInterval(interval);
  }, [fetchClasses]);


  const handleRefresh = async () => {
    if (auth.currentUser) await fetchClasses(auth.currentUser);
  };

  // --- UPDATED COPY LOGIC ---
  const copyCode = (code: string, id: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation(); // Stop bubbling
    
    navigator.clipboard.writeText(code);
    
    setCopiedId(id); // Set the specific ID
    setTimeout(() => setCopiedId(null), 2000); // Clear after 2 seconds
  };
  // --------------------------

  if (isLoading) {
    return (
      <div className={styles.dashboardContent} style={{ display: 'flex', justifyContent: 'center', paddingTop: '50px' }}>
        <p style={{color: '#666'}}>Loading classes...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContent}>
      
      <CreateClassModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleRefresh} 
      />

      <div className={styles.sectionHeader}>
        <div>
          <h1 className={styles.title}>My Classes</h1>
          <p className={styles.subtitle}>Manage your student groups and assignments.</p>
        </div>
      </div>

      <div className={styles.grid}>
        
        <button onClick={() => setIsModalOpen(true)} className={`${styles.card} ${styles.createCard}`} style={{ border:'2px dashed #d4b4d6', background:'transparent', width:'100%', cursor:'pointer' }}>
          <div className={styles.createContent}>
            <div className={styles.plusCircle}><Plus size={24} /></div>
            <div style={{ fontWeight: 'bold' }}>Create Class</div>
          </div>
        </button>

        {classes.map((cls, index) => {
          const cId = cls.id || cls.Id || cls.classId || cls.ClassId || index.toString();
          const cName = cls.name || cls.Name || cls.className || cls.ClassName || "Untitled Class";
          const cCode = cls.code || cls.Code || cls.classCode || cls.ClassCode || "NO-CODE";
          
          const cStudents = cls.studentCount ?? cls.StudentCount ?? cls.studentIds?.length ?? cls.StudentIds?.length ?? 0;
          const cDecks = cls.deckCount ?? cls.DeckCount ?? cls.assignmentIds?.length ?? cls.AssignmentIds?.length ?? 0;

          return (
            <Link href={`/classes/${cId}`} key={cId} className={styles.card}>
              
              <div className={styles.cardHeader}>
                <div className={`${styles.iconBox} ${styles.iconGreen}`}>
                  <Users size={22} />
                </div>
                
                {/* --- WRAPPER FOR POSITIONING --- */}
                <div style={{ position: 'relative' }}>
                    <button 
                      onClick={(e) => copyCode(cCode, cId, e)}
                      title="Copy Join Code"
                      className={styles.copyBtn}
                    >
                      {cCode} <Copy size={14} />
                    </button>

                    {/* ONLY SHOW IF THIS SPECIFIC ID IS COPIED */}
                    {copiedId === cId && (
                        <div style={{ 
                            position: 'absolute', 
                            top: '100%', 
                            right: '0', // Aligns to right edge of button
                            marginTop: '4px',
                            color: '#166534', 
                            fontSize: '0.75rem', 
                            fontWeight: '600',
                            whiteSpace: 'nowrap',
                            pointerEvents: 'none'
                        }}>
                            Copied!
                        </div>
                    )}
                </div>
                {/* ------------------------------- */}

              </div>

              <div className={styles.cardTitle}>{cName}</div>
              
              <div className={styles.cardStats}>
                <div className={styles.statItem}>
                  <Users size={16} /> {cStudents} Students
                </div>
                <div className={styles.statItem}>
                  <BookOpen size={16} /> {cDecks} Decks
                </div>
              </div>

            </Link>
          );
        })}

      </div>
    </div>
  );
}