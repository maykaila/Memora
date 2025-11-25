"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Copy, Users, BookOpen, Plus, Settings } from "lucide-react";
import { auth } from "../../../../initializeFirebase"; 
import { onAuthStateChanged } from "firebase/auth";
import styles from "./classDetails.module.css";

// Interfaces matching your data structure
interface Student {
  uid: string;
  username: string;
  email: string;
}

interface Assignment {
  setId: string;
  title: string;
  dateCreated: string;
  // completionRate?: number; // Only include if your backend calculates this
}

interface ClassDetails {
  classId: string;
  className: string;
  classCode: string;
  description?: string;
  studentIds: string[];
}

export default function ClassDetailsPage({ params }: { params: Promise<{ classId: string }> }) {
  const [classId, setClassId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"assignments" | "students">("assignments");
  
  // Data States
  const [classData, setClassData] = useState<ClassDetails | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();

  // 1. Unwrap Params
  useEffect(() => {
    params.then((resolvedParams) => {
      setClassId(resolvedParams.classId);
    });
  }, [params]);

  // 2. Fetch All Data
  useEffect(() => {
    if (!classId) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const idToken = await user.getIdToken();
          const headers = { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}` 
          };

          // A. Fetch Class Details (Basic Info)
          // Note: If you don't have a specific GET /{id} endpoint, we can fetch all and find one, 
          // but a direct endpoint is better. I'll assume you might add: [HttpGet("{id}")]
          const classRes = await fetch(`http://localhost:5261/api/classes/${classId}`, { headers });
          
          if (classRes.ok) {
            const cData = await classRes.json();
            setClassData(cData);
          } else {
            // Fallback: Fetch all and filter if single endpoint doesn't exist
            const allRes = await fetch(`http://localhost:5261/api/classes/teaching`, { headers });
            if (allRes.ok) {
                const allData: ClassDetails[] = await allRes.json();
                const found = allData.find(c => c.classId === classId);
                if (found) setClassData(found);
                else throw new Error("Class not found.");
            }
          }

          // B. Fetch Students
          // Backend needs an endpoint like: [HttpGet("{classId}/students")]
          const studentsRes = await fetch(`http://localhost:5261/api/classes/${classId}/students`, { headers });
          if (studentsRes.ok) {
            setStudents(await studentsRes.json());
          } else {
            console.warn("Could not fetch students list (Endpoint might be missing)");
            setStudents([]); // Default empty
          }

          // C. Fetch Assignments (Decks assigned to this class)
          // Backend needs: [HttpGet("{classId}/decks")]
          const decksRes = await fetch(`http://localhost:5261/api/classes/${classId}/decks`, { headers });
          if (decksRes.ok) {
            setAssignments(await decksRes.json());
          } else {
            // console.warn("Could not fetch assignments");
            setAssignments([]); 
          }

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
  }, [classId, router]);

  const copyCode = () => {
    if (classData?.classCode) {
      navigator.clipboard.writeText(classData.classCode);
      alert("Class code copied!");
    }
  };

  if (isLoading) return <div className={styles.container}><p>Loading Class...</p></div>;
  if (error) return <div className={styles.container}><p style={{color:'red'}}>Error: {error}</p></div>;
  if (!classData) return <div className={styles.container}><p>Class not found.</p></div>;

  return (
    <div className={styles.container}>

      {/* Header Card */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{classData.className}</h1>
          <div className={styles.subtitle}>
            <span 
              className={styles.codeBadge} 
              onClick={copyCode}
              title="Click to Copy"
            >
              Code: {classData.classCode} <Copy size={14} />
            </span>
            <span>|</span>
            <span>{students.length} Students</span>
            <span>|</span>
            <span>{assignments.length} Assignments</span>
          </div>
        </div>
        
        <div className={styles.headerActions}>
          <button className={styles.primaryBtn}>
            <Settings size={18} /> Settings
          </button>
        </div>
      </div>

      {/* Tabs */}
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

      {/* Content Area */}
      {activeTab === 'assignments' ? (
        <div className={styles.grid}>
          {/* Add Assignment Button */}
          <div 
            className={styles.card} 
            style={{ border: '2px dashed #d4b4d6', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', minHeight: '150px' }}
            onClick={() => alert("Feature: Open 'Assign Deck' Modal")}
          >
            <div style={{ background: '#f0c9ff', padding: '12px', borderRadius: '50%' }}>
              <Plus size={24} color="#4a1942" />
            </div>
            <div style={{ fontWeight: 'bold', color: '#4a1942', marginTop: '10px' }}>Assign New Deck</div>
          </div>

          {/* Assignment List */}
          {assignments.map((assign) => (
            <Link href={`/overviewOfCards?id=${assign.setId}`} key={assign.setId} className={styles.card}>
              <div className={styles.cardIcon}>
                <BookOpen size={20} />
              </div>
              <div>
                <div className={styles.cardTitle}>{assign.title}</div>
                <div className={styles.cardMeta}>
                  {/* Removed completion rate since backend might not have it yet */}
                  Assigned: {new Date(assign.dateCreated).toLocaleDateString()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className={styles.studentList}>
          {students.length === 0 ? (
            <div className={styles.emptyState}>No students have joined yet. Share the code <b>{classData.classCode}</b>!</div>
          ) : (
            students.map((student) => (
              <div key={student.uid} className={styles.studentRow}>
                <div className={styles.avatar}>
                  {/* Safe check for username */}
                  {(student.username || "?").charAt(0).toUpperCase()}
                </div>
                <div className={styles.studentInfo}>
                  <span className={styles.studentName}>{student.username || "Unknown Student"}</span>
                  <span className={styles.studentEmail}>{student.email}</span>
                </div>
                <button className={styles.removeBtn} title="Remove Student">
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