"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../initializeFirebase";
import { Users, MoreVertical, Archive, Trash2, PlusCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import styles from "../../components/dashboardLayout.module.css"; 
// Using your specific path for the modal
import JoinClassModal from "../../components/student/student-joinClass"; 

interface ClassItem {
  classId: string;
  className: string;
  classCode: string;
  teacherId: string;
  teacherName?: string; // <--- Using the new field
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
      // Added 'no-cache' to force fresh data
      const response = await fetch('http://localhost:5261/api/classes/joined', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${idToken}`, 'Cache-Control': 'no-cache' },
      });
      if (response.ok) {
        setClasses(await response.json());
      } else {
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
    const classList = classes.map((cls) => (
        <div key={cls.classId} style={{position:'relative'}}>
          <Link href={`/classes/${cls.classId}`} className={styles.standardCard}>
              <div className={`${styles.iconBox}`} style={{backgroundColor: '#dcfce7', color: '#166534'}}>
                <Users size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div className={styles.cardTitle}>{cls.className}</div>
                <div className={styles.cardMeta}>
                    {/* DISPLAY THE NAME HERE */}
                    Instructor: {cls.teacherName && cls.teacherName !== "Unknown Instructor" 
                        ? cls.teacherName 
                        : "Unknown"}
                </div>
              </div>
              
              <button 
                  onClick={(e) => toggleMenu(e, cls.classId)}
                  style={{background:'none', border:'none', cursor:'pointer', padding:'5px'}}
              >
                  <MoreVertical size={18} color="#666" />
              </button>
          </Link>

          {activeMenuId === cls.classId && (
              <div style={{
                  position: 'absolute', top: '50px', right: '10px',
                  backgroundColor: 'white', borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 10,
                  minWidth: '120px', border: '1px solid #eee', overflow:'hidden'
              }}>
                  <button onClick={() => handleArchive(cls.classId)} style={{display:'flex', gap:'8px', width:'100%', padding:'10px', border:'none', background:'white', cursor:'pointer', textAlign:'left', fontSize:'0.9rem'}}>
                      <Archive size={16} /> Archive
                  </button>
                  <button onClick={() => handleDelete(cls.classId)} style={{display:'flex', gap:'8px', width:'100%', padding:'10px', border:'none', background:'white', cursor:'pointer', textAlign:'left', fontSize:'0.9rem', color:'#d32f2f'}}>
                      <Trash2 size={16} /> Leave
                  </button>
              </div>
          )}
        </div>
    ));

    return (
      <div className={styles.recentsGrid}>
        {classList}
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
    );
  };

  return (
    <div className={styles.dashboardContent}>
      <JoinClassModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} onSuccess={handleJoinSuccess} />
      <section className={styles.dashboardSection}>
        <div className={styles.sectionHeader}>
            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                <h2 className={styles.sectionTitle} style={{marginBottom:0}}>My Classes</h2>
                {/* <button onClick={fetchClasses} style={{border:'none', background:'none', cursor:'pointer', color:'#666'}}><RefreshCw size={16} /></button> */}
            </div>
            {/* <button onClick={() => setIsJoinModalOpen(true)} className={styles.actionLink} style={{background:'none', border:'none', cursor:'pointer', fontSize:'0.9rem', fontWeight:'bold'}}>+ Join Class</button> */}
        </div>
        {isLoading ? <p className={styles.emptyText}>Loading classes...</p> : renderClasses()}
      </section>
    </div>
  );
}