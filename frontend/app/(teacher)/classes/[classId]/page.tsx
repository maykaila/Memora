"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Copy, Users, BookOpen, Plus, Settings } from "lucide-react";
import { auth } from "../../../../initializeFirebase"; 
import { onAuthStateChanged } from "firebase/auth";
import styles from "./classDetails.module.css";

// Interfaces matching your Backend DTOs
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
  
  // Lists of IDs (Robust for C# PascalCase or camelCase)
  studentIds?: string[];
  StudentIds?: string[];
  
  assignmentIds?: string[];
  AssignmentIds?: string[];
}

export default function ClassDetailsPage({ params }: { params: Promise<{ classId: string }> }) {
  const [classId, setClassId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"assignments" | "students">("assignments");
  
  const [classData, setClassData] = useState<ClassDetails | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    params.then((resolvedParams) => {
      setClassId(resolvedParams.classId);
    });
  }, [params]);

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

          // A. Fetch Class Details
          const classRes = await fetch(`http://localhost:5261/api/classes/${classId}`, { headers });
          if (classRes.ok) {
            const cData = await classRes.json();
            setClassData(cData);
          } else {
            // Fallback if specific endpoint fails
            const allRes = await fetch(`http://localhost:5261/api/classes/teaching`, { headers });
            if (allRes.ok) {
                const allData: ClassDetails[] = await allRes.json();
                const found = allData.find(c => c.classId === classId || (c as any).id === classId);
                if (found) setClassData(found);
                else throw new Error("Class not found.");
            }
          }

          // B. Fetch Students List
          const studentsRes = await fetch(`http://localhost:5261/api/classes/${classId}/students`, { headers });
          if (studentsRes.ok) {
            const studentsData = await studentsRes.json();
            setStudents(studentsData);
          }

          // C. Fetch Assignments
          const decksRes = await fetch(`http://localhost:5261/api/classes/${classId}/decks`, { headers });
          if (decksRes.ok) {
            const decksData = await decksRes.json();
            setAssignments(decksData);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Calculate counts safely using the raw ID lists first
  const studentCount = classData?.studentIds?.length ?? classData?.StudentIds?.length ?? students.length ?? 0;
  const assignmentCount = classData?.assignmentIds?.length ?? classData?.AssignmentIds?.length ?? assignments.length ?? 0;

  if (isLoading) return <div className={styles.container}><p>Loading Class...</p></div>;
  if (error) return <div className={styles.container}><p style={{color:'red'}}>Error: {error}</p></div>;
  if (!classData) return <div className={styles.container}><p>Class not found.</p></div>;

  return (
    <div className={styles.container}>
      <Link href="/teacher-dashboard" className={styles.backLink}>
        <ArrowLeft size={18} /> Back to Dashboard
      </Link>

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
            {/* UPDATED: Uses robust count logic */}
            <span>{studentCount} Students</span>
            <span>|</span>
            <span>{assignmentCount} Assignments</span>
          </div>
        </div>
        
        <div className={styles.headerActions}>
          <button className={styles.primaryBtn} style={{background: '#fff', color: '#4a1942', border: '1px solid #eee'}}>
            <Settings size={18} /> Settings
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
            onClick={() => alert("Feature: Open 'Assign Deck' Modal")}
          >
            <div style={{ background: '#f0c9ff', padding: '12px', borderRadius: '50%' }}>
              <Plus size={24} color="#4a1942" />
            </div>
            <div style={{ fontWeight: 'bold', color: '#4a1942', marginTop: '10px' }}>Assign New Deck</div>
          </div>

          {assignments.map((assign) => (
            <Link href={`/overviewOfCards?id=${assign.setId}`} key={assign.setId} className={styles.card}>
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
                {/* Helpful message if count > 0 but list is empty (loading error) */}
                {studentCount > 0 
                    ? "Students joined, but details could not be loaded."
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