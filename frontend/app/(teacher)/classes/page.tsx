"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../initializeFirebase"; 
import { Users, Plus, Copy, BookOpen } from "lucide-react";
import styles from "./classes.module.css"; 
import CreateClassModal from "../../components/teacher/CreateClassModal"; 

// FIX: Updated interface to include Arrays (StudentIds, AssignmentIds) for counting
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
  // Add Lists to check length
  studentIds?: string[];
  StudentIds?: string[];
  
  deckCount?: number;
  DeckCount?: number;
  // Add Lists to check length
  assignmentIds?: string[];
  AssignmentIds?: string[];
}

export default function MyClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const router = useRouter();

  // Extracted fetch logic for reuse
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

  // Re-fetches data every 4 seconds to update student counts automatically
  useEffect(() => {
    const interval = setInterval(() => {
        if (auth.currentUser) {
            fetchClasses(auth.currentUser); // Silent fetch (no loading spinner)
        }
    }, 4000); 

    return () => clearInterval(interval);
  }, [fetchClasses]);
  // ------------------------------

  const handleRefresh = async () => {
    if (auth.currentUser) await fetchClasses(auth.currentUser);
  };

  const copyCode = (code: string, e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(code);
    // alert(`Copied join code: ${code}`);
  };

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
        
        {/* Create Class Card opens modal */}
        <button onClick={() => setIsModalOpen(true)} className={`${styles.card} ${styles.createCard}`} style={{ border:'2px dashed #d4b4d6', background:'transparent', width:'100%', cursor:'pointer' }}>
          <div className={styles.createContent}>
            <div className={styles.plusCircle}><Plus size={24} /></div>
            <div style={{ fontWeight: 'bold' }}>Create Class</div>
          </div>
        </button>

        {classes.map((cls, index) => {
          // 1. ID & Name Fallbacks
          const cId = cls.id || cls.Id || cls.classId || cls.ClassId || index.toString();
          const cName = cls.name || cls.Name || cls.className || cls.ClassName || "Untitled Class";
          const cCode = cls.code || cls.Code || cls.classCode || cls.ClassCode || "NO-CODE";
          
          // 2. CALCULATE COUNTS
          // Checks if 'studentCount' exists, otherwise counts the 'studentIds' array length
          const cStudents = cls.studentCount ?? cls.StudentCount ?? cls.studentIds?.length ?? cls.StudentIds?.length ?? 0;
          
          // Checks if 'deckCount' exists, otherwise counts the 'assignmentIds' array length
          const cDecks = cls.deckCount ?? cls.DeckCount ?? cls.assignmentIds?.length ?? cls.AssignmentIds?.length ?? 0;

          return (
            <Link href={`/classes/${cId}`} key={cId} className={styles.card}>
              
              <div className={styles.cardHeader}>
                <div className={`${styles.iconBox} ${styles.iconGreen}`}>
                  <Users size={22} />
                </div>
                <button 
                  onClick={(e) => copyCode(cCode, e)}
                  title="Copy Join Code"
                  className={styles.copyBtn}
                >
                  {cCode} <Copy size={14} />
                </button>
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