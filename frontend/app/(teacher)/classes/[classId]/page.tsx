"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Copy, Users, BookOpen, Plus, Settings } from "lucide-react";
import { auth } from "../../../../initializeFirebase"; 
import { onAuthStateChanged } from "firebase/auth";
import styles from "./classDetails.module.css";
import AssignDeckModal from "../../../components/teacher/assignDeckModal";
import ClassSettingsModal from "../../../components/teacher/classSettingsModal";

// ... [Interfaces remain the same] ...
interface Student {
  uid: string;
  username: string;
  email: string;
}

interface Assignment {
  setId: string;
  title: string;
  dateCreated: string;
}

interface ClassDetails {
  classId: string;
  className: string;
  classCode: string;
  description?: string;
  studentIds: string[];
  assignmentIds: string[];
}

export default function ClassDetailsPage({ params }: { params: Promise<{ classId: string }> }) {
  const [classId, setClassId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"assignments" | "students">("assignments");
  
  const [classData, setClassData] = useState<ClassDetails | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // --- NEW STATE FOR COPIED FEEDBACK ---
  const [copied, setCopied] = useState(false); 
  // -------------------------------------

  const router = useRouter();

  useEffect(() => {
    params.then((resolvedParams) => {
      setClassId(resolvedParams.classId);
    });
  }, [params]);

  // ... [fetchClassData function remains the same] ...
  const fetchClassData = useCallback(async (user: any, currentClassId: string) => {
    const idToken = await user.getIdToken();
    const headers = { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}` 
    };

    // A. Fetch Class Details
    const classRes = await fetch(`https://memora-api.dcism.org/api/classes/${currentClassId}`, { headers });
    if (classRes.ok) {
      const rawData = await classRes.json();
      setClassData({
          classId: rawData.classId || rawData.ClassId,
          className: rawData.className || rawData.ClassName || "Untitled Class",
          classCode: rawData.classCode || rawData.ClassCode || "NO-CODE",
          description: rawData.description || rawData.Description,
          studentIds: rawData.studentIds || rawData.StudentIds || [],
          assignmentIds: rawData.assignmentIds || rawData.AssignmentIds || []
      });
    } else {
      // Fallback logic
      const allRes = await fetch(`https://memora-api.dcism.org/api/classes/teaching`, { headers });
      if (allRes.ok) {
          const allData = await allRes.json();
          const found = allData.find((c: any) => (c.classId || c.ClassId) === currentClassId);
          if (found) {
              setClassData({
                  classId: found.classId || found.ClassId,
                  className: found.className || found.ClassName || "Untitled Class",
                  classCode: found.classCode || found.ClassCode || "NO-CODE",
                  description: found.description || found.Description,
                  studentIds: found.studentIds || found.StudentIds || [],
                  assignmentIds: found.assignmentIds || found.AssignmentIds || []
              });
          } else {
              throw new Error("Class not found.");
          }
      }
    }

    // B. Fetch Students List
    const studentsRes = await fetch(`https://memora-api.dcism.org/api/classes/${currentClassId}/students`, { headers });
    if (studentsRes.ok) {
      const rawStudents = await studentsRes.json();
      const mappedStudents = rawStudents.map((s: any) => ({
          uid: s.uid || s.userId || s.UserId || Math.random().toString(),
          username: s.username || s.Username || "Unknown",
          email: s.email || s.Email || ""
      }));
      setStudents(mappedStudents);
    } else {
      setStudents([]); 
    }

    // C. Fetch Assignments
    const decksRes = await fetch(`https://memora-api.dcism.org/api/classes/${currentClassId}/decks`, { headers });
    if (decksRes.ok) {
      const rawDecks = await decksRes.json();
      const mappedDecks = rawDecks.map((d: any) => ({
          setId: d.setId || d.flashcardSetId || d.FlashcardSetId || d.Id || Math.random().toString(),
          title: d.title || d.Title || "Untitled Deck",
          dateCreated: d.dateCreated || d.DateCreated || new Date().toISOString()
      }));
      setAssignments(mappedDecks);
    } else {
      setAssignments([]); 
    }
  }, []);

  // ... [useEffect hooks remain the same] ...
  useEffect(() => {
    if (!classId) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          await fetchClassData(user, classId);
        } catch (err: any) {
          console.error("Error loading class data:", err);
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [classId, router, fetchClassData]);

  useEffect(() => {
    if (!classId) return;
    const interval = setInterval(() => {
        if (auth.currentUser) {
            fetchClassData(auth.currentUser, classId);
        }
    }, 4000); 

    return () => clearInterval(interval);
  }, [classId, fetchClassData]);

  const handleRefresh = async () => {
    if (auth.currentUser && classId) {
        await fetchClassData(auth.currentUser, classId);
    }
  };

  // Remove Student
  const handleRemoveStudent = async (studentUid: string) => {
    if (!confirm("Are you sure you want to remove this student?")) return;

    try {
        const user = auth.currentUser;
        if (!user) return;
        const token = await user.getIdToken();

        const res = await fetch(`https://memora-api.dcism.org/api/classes/${classId}/students/${studentUid}`, {
            method: 'DELETE',
            headers: { 
                Authorization: `Bearer ${token}` 
            }
        });

        if (res.ok) {
            // Optimistically update UI (remove from list immediately)
            setStudents(prev => prev.filter(s => s.uid !== studentUid));
            // Trigger refresh to ensure counts update
            handleRefresh();
        } else {
            alert("Failed to remove student.");
        }
    } catch (e) {
        console.error(e);
        alert("Error removing student.");
    }
  };

  // --- UPDATED COPY LOGIC ---
  const copyCode = () => {
    if (classData?.classCode) {
      navigator.clipboard.writeText(classData.classCode);
      setCopied(true); // Show message
      setTimeout(() => setCopied(false), 2000); // Hide message after 2 seconds
    }
  };
  // --------------------------

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const studentCount = classData?.studentIds?.length ?? students.length ?? 0;
  const assignmentCount = classData?.assignmentIds?.length ?? assignments.length ?? 0;

  if (isLoading) return <div className={styles.container}><p>Loading Class...</p></div>;
  if (error) return <div className={styles.container}><p style={{color:'red'}}>Error: {error}</p></div>;
  if (!classData) return <div className={styles.container}><p>Class not found.</p></div>;

  return (
    <div className={styles.container}>
      
      <AssignDeckModal 
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        classId={classId}
        onSuccess={handleRefresh}
      />

      <ClassSettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        classId={classId}
        currentName={classData.className}
        onUpdateSuccess={handleRefresh}
      />

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{classData.className}</h1>
          <div className={styles.subtitle}>
            
            {/* --- UPDATED BADGE WITH MESSAGE --- */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
                <span 
                className={styles.codeBadge} 
                onClick={copyCode}
                title="Click to Copy"
                >
                    Code: {classData.classCode} <Copy size={14} />
                </span>
                
                {copied && (
                    <div style={{ 
                        position: 'absolute', 
                        top: '100%', 
                        left: '50%', 
                        transform: 'translateX(-50%)', // Centers it relative to badge
                        marginTop: '4px',
                        color: '#166534',
                        fontSize: '0.75rem', 
                        fontWeight: '600',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none' // Ensures clicks go through if needed
                    }}>
                        Copied!
                    </div>
                )}
            </div>
            {/* ---------------------------------- */}

            <span>|</span>
            <span>{studentCount} Students</span>
            <span>|</span>
            <span>{assignmentCount} Assignments</span>
          </div>
        </div>
        
        <div className={styles.headerActions}>
          <button 
            className={styles.settingsBtn} 
            onClick={() => setIsSettingsModalOpen(true)}
            >
            <Settings size={20} />
          </button>
        </div>
      </div>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'assignments' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          Assignments
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'students' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('students')}
        >
          Students
        </button>
      </div>

      {activeTab === 'assignments' ? (
        <div className={styles.grid}>
          <div 
            className={styles.card} 
            style={{ border: '2px dashed #d4b4d6', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', minHeight: '150px' }}
            onClick={() => setIsAssignModalOpen(true)}
          >
            <div style={{ background: '#f0c9ff', padding: '12px', borderRadius: '50%' }}>
              <Plus size={24} color="#4a1942" />
            </div>
            <div style={{ fontWeight: 'bold', color: '#4a1942', marginTop: '10px' }}>Assign New Deck</div>
          </div>

          {assignments.map((assign) => (
            <Link href={`/teacher-cardOverview?id=${assign.setId}`} key={assign.setId} className={styles.card}>
              <div className={styles.cardIcon}>
                <BookOpen size={20} />
              </div>
              <div>
                <div className={styles.cardTitle}>{assign.title}</div>
                <div className={styles.cardMeta}>
                  Assigned: {formatDate(assign.dateCreated)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className={styles.studentList}>
          {students.length === 0 ? (
            <div className={styles.emptyState}>
                {studentCount > 0 
                    ? "Students joined, but list details failed to load."
                    : <span>No students have joined yet. Share the code <b>{classData.classCode}</b>!</span>
                }
            </div>
          ) : (
            students.map((student) => (
              <div key={student.uid} className={styles.studentRow}>
                <div className={styles.avatar}>
                  {(student.username || "?").charAt(0).toUpperCase()}
                </div>
                <div className={styles.studentInfo}>
                  <span className={styles.studentName}>{student.username || "Unknown Student"}</span>
                  <span className={styles.studentEmail}>{student.email}</span>
                </div>
                <button 
                    className={styles.removeBtn} 
                    title="Remove Student"
                    onClick={() => handleRemoveStudent(student.uid)}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}