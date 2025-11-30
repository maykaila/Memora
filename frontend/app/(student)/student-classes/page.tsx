"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../initializeFirebase";
import { Users, MoreVertical, Archive, Trash2, PlusCircle } from "lucide-react";
import Link from "next/link";
import styles from "../../components/dashboardLayout.module.css";
import JoinClassModal from "../../components/student/student-joinClass";

// 1. Update Interface to be flexible (like your teacher file)
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

  teacherId?: string;
  TeacherId?: string;

  teacherName?: string;
  TeacherName?: string;
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
      const response = await fetch('http://localhost:5261/api/classes/joined', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${idToken}`, 'Cache-Control': 'no-cache' },
      });
      
      if (response.ok) {
        const data = await response.json();
        // DEBUG: Check your console to see exactly what the backend sends
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

  const handleArchive = (id: string) => alert(`Archiving class ${id}`);
  const handleDelete = (id: string) => alert(`Leaving class ${id}`);

  const renderClasses = () => {
    return classes.map((cls, index) => {
        // 2. DEFINE SAFE VARIABLES
        // Normalize the data so it works regardless of Casing
        const displayId = cls.classId || cls.ClassId || cls.id || cls.Id || `unknown-${index}`;
        const displayName = cls.className || cls.ClassName || cls.name || cls.Name || "Untitled Class";
        const displayTeacher = cls.teacherName || cls.TeacherName || "Unknown Instructor";

        return (
            <div key={displayId} style={{position:'relative'}}>
              {/* Use displayId in the link */}
              <Link href={`/classes/${displayId}`} className={styles.standardCard}>
                  <div className={`${styles.iconBox}`} style={{backgroundColor: '#dcfce7', color: '#166534'}}>
                    <Users size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    {/* Use displayName */}
                    <div className={styles.cardTitle}>{displayName}</div>
                    <div className={styles.cardMeta}>
                        Instructor: {displayTeacher}
                    </div>
                  </div>
                  
                  <button
                      onClick={(e) => toggleMenu(e, displayId)}
                      style={{background:'none', border:'none', cursor:'pointer', padding:'5px'}}
                  >
                      <MoreVertical size={18} color="#666" />
                  </button>
              </Link>

              {activeMenuId === displayId && (
                  <div style={{
                      position: 'absolute', top: '50px', right: '10px',
                      backgroundColor: 'white', borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 10,
                      minWidth: '120px', border: '1px solid #eee', overflow:'hidden'
                  }}>
                      <button onClick={() => handleArchive(displayId)} style={{display:'flex', gap:'8px', width:'100%', padding:'10px', border:'none', background:'white', cursor:'pointer', textAlign:'left', fontSize:'0.9rem'}}>
                          <Archive size={16} /> Archive
                      </button>
                      <button onClick={() => handleDelete(displayId)} style={{display:'flex', gap:'8px', width:'100%', padding:'10px', border:'none', background:'white', cursor:'pointer', textAlign:'left', fontSize:'0.9rem', color:'#d32f2f'}}>
                          <Trash2 size={16} /> Leave
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
            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                <h2 className={styles.sectionTitle} style={{marginBottom:0}}>My Classes</h2>
            </div>
        </div>
        
        <div className={styles.recentsGrid}>
            {isLoading ? <p className={styles.emptyText}>Loading classes...</p> : renderClasses()}
            
            {/* Moved the Join Button inside the grid so it sits next to classes */}
            <button
                onClick={() => setIsJoinModalOpen(true)}
                className={styles.standardCard}
                style={{ borderStyle: 'dashed', background: 'transparent', borderColor: '#4a1942', cursor:'pointer', width: '100%', textAlign:'left' }}
            >
                <div className={`${styles.iconBox}`} style={{background: 'transparent', color: '#4a1942'}}>
                   <PlusCircle size={20} />
                </div>
                <div className={styles.cardTitle}>Join a Class</div>
            </button>
        </div>
      </section>
    </div>
  );
}