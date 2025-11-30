"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Settings, DoorOpen, Archive, User, BookOpen } from "lucide-react";
import styles from "./studentClass.module.css"; 
import { auth } from "../../../../initializeFirebase"; 
import { onAuthStateChanged } from "firebase/auth";

interface ClassMember {
    uid: string;
    username: string;
    email: string;
    role: "student" | "teacher"; 
}

interface AssignedDeck {
    setId: string;
    title: string;
    dateAssigned: string;
    progress: number; 
    status: 'Not Started' | 'In Progress' | 'Completed';
}

interface ClassDetails {
    classId: string;
    className: string;
    classCode: string;
    instructorId: string;
    teacherName?: string; // <--- ADDED THIS
    description?: string;
    studentIds: string[];
}

export default function StudentClassPage({ params }: { params: Promise<any> }) {
    const [classId, setClassId] = useState<string>("");
    const [activeTab, setActiveTab] = useState<'assignments' | 'members'>('assignments');
    
    const [classData, setClassData] = useState<ClassDetails | null>(null);
    const [instructor, setInstructor] = useState<ClassMember | null>(null);
    const [students, setStudents] = useState<ClassMember[]>([]);
    const [assignments, setAssignments] = useState<AssignedDeck[]>([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();

    useEffect(() => {
        params.then((resolvedParams) => {
            const id = resolvedParams['student-classId'] || resolvedParams.classId;
            
            if (id) {
                setClassId(id);
            } else {
                console.error("Could not find Class ID in URL parameters", resolvedParams);
                setError("Invalid URL parameters");
                setIsLoading(false);
            }
        });
    }, [params]);

    const fetchClassData = useCallback(async (user: any, currentClassId: string) => {
        const idToken = await user.getIdToken();
        const headers = { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}` 
        };

        // 1. Fetch Class Details
        const classRes = await fetch(`http://localhost:5261/api/classes/${currentClassId}`, { headers });
        if (!classRes.ok) {
            throw new Error("Class not found or access denied.");
        }
        const rawData = await classRes.json();
        
        // Map the response (Including the new TeacherName)
        const classDetails: ClassDetails = {
            classId: rawData.classId || rawData.ClassId,
            className: rawData.className || rawData.ClassName || "Untitled Class",
            classCode: rawData.classCode || rawData.ClassCode || "NO-CODE",
            description: rawData.description || rawData.Description,
            // Important: Backend sends 'TeacherId', so we map that to instructorId
            instructorId: rawData.teacherId || rawData.TeacherId || rawData.instructorId, 
            studentIds: rawData.studentIds || rawData.StudentIds || [],
            // Capture the name we just added to the backend
            teacherName: rawData.teacherName || rawData.TeacherName 
        };
        setClassData(classDetails);
        
        // Set Instructor immediately using the name from ClassDetails
        setInstructor({
            uid: classDetails.instructorId,
            username: classDetails.teacherName || "Instructor", 
            email: "", // Email might not be available yet, that's okay
            role: "teacher"
        });

        // 2. Fetch Assignments
        try {
            const assignmentsRes = await fetch(`http://localhost:5261/api/classes/${currentClassId}/assignments/me`, { headers });
            if (assignmentsRes.ok) {
                const rawAssignments = await assignmentsRes.json();
                const mappedAssignments: AssignedDeck[] = rawAssignments.map((a: any) => ({
                    setId: a.setId || a.SetId,
                    title: a.title || a.Title || "Untitled Assignment",
                    dateAssigned: a.dateAssigned || a.DateAssigned || new Date().toISOString(),
                    progress: a.progress || 0,
                    status: (a.progress === 100) ? 'Completed' : (a.progress > 0) ? 'In Progress' : 'Not Started',
                }));
                setAssignments(mappedAssignments);
            } else {
                setAssignments([]);
            }
        } catch (e) {
            console.warn("Could not fetch assignments", e);
            setAssignments([]);
        }

        // 3. Fetch Members (Students)
        // Note: Your GetStudentsInClass endpoint likely only returns students, not the teacher.
        const membersRes = await fetch(`http://localhost:5261/api/classes/${currentClassId}/students`, { headers });
        if (membersRes.ok) {
            const rawMembers = await membersRes.json();
            const allMembers: ClassMember[] = rawMembers.map((m: any) => ({
                uid: m.uid || m.userId || m.UserId,
                username: m.username || m.Username || "Unknown",
                email: m.email || m.Email || "",
                role: 'student' 
            }));
            setStudents(allMembers);
        } else {
            setStudents([]); 
        }

    }, []);

    useEffect(() => {
        if (!classId) return;

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    await fetchClassData(user, classId);
                } catch (err: any) {
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

    const handleLeaveClass = async () => {
        if (!classId) return;
        if (confirm("Are you sure you want to LEAVE this class?")) {
            setIsLoading(true);
            try {
                const user = auth.currentUser;
                if (!user) { router.push('/login'); return; }
                const idToken = await user.getIdToken();
                // Ensure this endpoint exists in your controller (it was named 'DeleteClass' in previous snippets, you might need to add a 'leave' endpoint or use delete if you intended that)
                // For now assuming you handle the logic:
                const response = await fetch(`http://localhost:5261/api/classes/${classId}/leave`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${idToken}` }
                });
                if (!response.ok) throw new Error("Failed to leave class.");
                alert('You have successfully left the class.');
                router.push('/dashboard'); 
            } catch (err: any) {
                setError(err.message);
                setIsLoading(false);
            }
        }
    };

    const handleAccessDeck = (setId: string) => {
        router.push(`/study/${setId}?classId=${classId}`);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    if (isLoading) return <div className={styles.page}><p>Loading Class Data...</p></div>;
    if (error) return <div className={styles.page}><p style={{color:'red'}}>Error: {error}</p></div>;
    if (!classData) return <div className={styles.page}><p>Class not found.</p></div>;

    const studentCount = classData.studentIds?.length ?? 0;

    const renderAssignments = () => (
        <div className={styles.assignmentsGrid}>
            {assignments.length > 0 ? (
                assignments.map((assignment) => (
                    <div 
                        key={assignment.setId} 
                        className={styles.assignmentCard}
                        onClick={() => handleAccessDeck(assignment.setId)}
                    >
                        <div className={styles.cardIcon}>
                            <BookOpen size={24} strokeWidth={2.5} />
                        </div>
                        
                        <div className={styles.cardContent}>
                            <h3 className={styles.cardTitle}>{assignment.title}</h3>
                            <p className={styles.cardDate}>Assigned: {formatDate(assignment.dateAssigned)}</p>
                        </div>
                    </div>
                ))
            ) : (
                <div className={styles.emptyState}>
                    <p>No decks have been assigned to this class yet.</p>
                </div>
            )}
        </div>
    );

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.className}>{classData.className}</h1>
                    <div className={styles.classInfoRow}>
                        <span className={styles.classCodeBadge}>
                            Code: {classData.classCode}
                        </span>
                        <span className={styles.infoSeparator}>|</span>
                        
                        {/* INSTRUCTOR NAME DISPLAY */}
                        <span>Instructor: {instructor?.username || "Loading..."}</span>
                        
                        <span className={styles.infoSeparator}>|</span>
                        <span>{studentCount} Members</span>
                    </div>
                </div>
                <div className={styles.settingsDropdown}>
                    <Settings size={24} style={{ cursor: 'pointer' }} />
                    <div className={styles.dropdownContent}>
                        <button className={styles.dropdownItem} onClick={handleLeaveClass} disabled={isLoading}>
                            <DoorOpen size={16} /> Leave Class
                        </button>
                        <button className={styles.dropdownItem} onClick={() => alert("Archive functionality coming soon!")} disabled={isLoading}>
                            <Archive size={16} /> Archive Class
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.tabsContainer}>
                <button
                    className={`${styles.tab} ${activeTab === 'assignments' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('assignments')}
                >
                    Assignments
                </button>
            </div>

            <div className={styles.contentArea}>
                {renderAssignments()}
            </div>
        </div>
    );
}