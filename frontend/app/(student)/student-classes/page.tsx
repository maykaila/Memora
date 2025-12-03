"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../initializeFirebase";
import { Users, MoreVertical, Archive, Trash2, Plus, BookOpen } from "lucide-react";
import Link from "next/link";
import styles from "./classStyle.module.css"; 
import JoinClassModal from "../../components/student/student-joinClass";

// 1. Update Interface
interface ClassItem {
  classId?: string;
  ClassId?: string;
  id?: string;
  Id?: string;

  className?: string;
  ClassName?: string;
  name?: string;
  Name?: string;

  classCode?: string;
  ClassCode?: string;
  
  // NEW FIELDS
  teacherName?: string;
  TeacherName?: string;

  deckCount?: number; 
  DeckCount?: number;
}

export default function StudentClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const router = useRouter();

  const fetchClasses = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      // Ensure this endpoint returns the list of ClassDto objects we created on the backend
      const response = await fetch('https://memora-api.dcism.org/api/classes/joined', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${idToken}`, 'Cache-Control': 'no-cache' },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Joined Classes Data:", data); 
        setClasses(data);
      } else {
        console.error("Failed to fetch classes, status:", response.status);
        setClasses([]);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoading(true);
        await fetchClasses();
        setIsLoading(false);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router, fetchClasses]);

  const handleJoinSuccess = async () => {
    setTimeout(async () => await fetchClasses(), 1000);
  };

  const toggleMenu = (e: React.MouseEvent, classId: string) => {
    e.preventDefault(); e.stopPropagation();
    setActiveMenuId(activeMenuId === classId ? null : classId);
  };

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // const handleArchive = (id: string) => alert(`Archiving class ${id}`);
  const handleDelete = (id: string) => alert(`Leaving class ${id}`);

  const renderClasses = () => {
    return classes.map((cls, index) => {
        // Normalize Data
        const displayId = cls.classId || cls.ClassId || cls.id || cls.Id || `unknown-${index}`;
        const displayName = cls.className || cls.ClassName || cls.name || cls.Name || "Untitled Class";
        const displayCode = cls.classCode || cls.ClassCode || "NOCODE";
        const deckCount = cls.deckCount || cls.DeckCount || 0; 

        // --- NEW: Normalize Instructor Name ---
        // Defaults to "Unknown Instructor" if the backend sends null or nothing
        const instructorName = cls.teacherName || cls.TeacherName || "Unknown Instructor";

        return (
            <div key={displayId} style={{position:'relative'}}>
              <Link href={`/student-classes/${displayId}`} className={styles.classCard}>
                  
                  {/* Top Row: Icon and Code Badge */}
                  <div className={styles.cardHeader}>
                    <div className={styles.classIcon}>
                        <Users size={20} />
                    </div>
                    {/* Only the code, not copyable */}
                    <div className={styles.codeBadge}>
                        {displayCode}
                    </div>
                  </div>

                  {/* Middle: Title AND Instructor */}
                  <div className={styles.cardBody}>
                    <div className={styles.cardTitle}>{displayName}</div>
                    
                    {/* --- ADDED INSTRUCTOR DISPLAY HERE --- */}
                    <div style={{ 
                        fontSize: '0.85rem', 
                        color: '#64748b', 
                        marginTop: '4px',
                        fontWeight: 500
                    }}>
                        Instructor: {instructorName}
                    </div>

                  </div>

                  {/* Bottom: Stats (Decks only as requested) */}
                  <div className={styles.cardFooter}>
                    <div className={styles.statItem}>
                        <BookOpen size={16} />
                        <span>{deckCount} Decks</span>
                    </div>
                  </div>

                  {/* Menu Button (Positioned Absolute) */}
                  <button
                      onClick={(e) => toggleMenu(e, displayId)}
                      style={{
                        position: 'absolute', 
                        top: '24px', 
                        right: '15px', 
                        background:'none', 
                        border:'none', 
                        cursor:'pointer'
                      }}
                  >
                      <MoreVertical size={20} color="#cbd5e1" />
                  </button>
              </Link>

              {activeMenuId === displayId && (
                  <div style={{
                      position: 'absolute', top: '50px', right: '10px',
                      backgroundColor: 'white', borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 10,
                      minWidth: '140px', border: '1px solid #eee', overflow:'hidden'
                  }}>
                      {/* <button onClick={() => handleArchive(displayId)} style={{display:'flex', gap:'8px', width:'100%', padding:'12px', border:'none', background:'white', cursor:'pointer', textAlign:'left', fontSize:'0.9rem', alignItems:'center'}}>
                          <Archive size={16} /> Archive
                      </button> */}
                      <button onClick={() => handleDelete(displayId)} style={{display:'flex', gap:'8px', width:'100%', padding:'12px', border:'none', background:'white', cursor:'pointer', textAlign:'left', fontSize:'0.9rem', color:'#d32f2f', alignItems:'center'}}>
                          <Trash2 size={16} /> Leave Class
                      </button>
                  </div>
              )}
            </div>
        );
    });
  };

  return (
    <div className={styles.dashboardContent}>
      <JoinClassModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} onSuccess={handleJoinSuccess} />
      
      <section className={styles.dashboardSection}>
        <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>My Classes</h2>
        </div>
        
        <div className={styles.recentsGrid}>
            {/* 1. Join Class Card */}
            <button
                onClick={() => setIsJoinModalOpen(true)}
                className={styles.actionCard}
            >
                <div className={styles.actionIconWrapper}>
                   <Plus size={24} strokeWidth={3} />
                </div>
                <div className={styles.actionText}>Join Class</div>
            </button>

            {/* 2. List of Classes */}
            {isLoading ? (
                <p style={{color: '#666'}}>Loading classes...</p> 
            ) : (
                renderClasses()
            )}
        </div>
      </section>
    </div>
  );
}