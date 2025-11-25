"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { auth } from "../../../initializeFirebase"; // Adjust path! (likely ../../../)
// We can reuse the CSS module we made earlier, or create a new one
// If you want to reuse the one from 'classes/create', import it from there.
// For now, I'll assume you copy the CSS file into this folder too.
import styles from "./createClass.module.css"; 

export default function CreateClassPage() {
  const router = useRouter();
  const [className, setClassName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!className.trim()) {
      alert("Please enter a class name.");
      setIsLoading(false);
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in.");
        router.push("/login");
        return;
      }
      const idToken = await user.getIdToken();

      // Real backend call
      const response = await fetch('http://localhost:5261/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ ClassName: className })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create class.");
      }

      const newClass = await response.json();
      setGeneratedCode(newClass.classCode); 

    } catch (error: any) {
      console.error("Error creating class:", error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      
      <button onClick={() => router.back()} className={styles.backButton}>
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      <div className={styles.card}>
        
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <GraduationCap size={32} />
          </div>
          <h1 className={styles.title}>Create New Class</h1>
        </div>

        {!generatedCode ? (
          <form onSubmit={handleCreateClass}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Class Name</label>
              <input
                className={styles.input}
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="e.g. Biology 101 - Section A"
              />
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                onClick={() => router.back()}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={styles.submitButton}
              >
                {isLoading ? "Creating..." : "Create Class"}
              </button>
            </div>
          </form>
        ) : (
          <div className={styles.successState}>
            <h2 className={styles.successTitle}>Class Created Successfully!</h2>
            <p className={styles.successText}>Share this code with your students so they can join:</p>
            
            <div className={styles.codeBox}>
              {generatedCode}
            </div>

            <button 
              onClick={() => router.push('/teacher-dashboard')} // Ensure this goes to the right dashboard
              className={styles.submitButton}
              style={{width: '100%'}}
            >
              Back to Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  );
}