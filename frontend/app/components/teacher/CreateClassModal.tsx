"use client";

import { useState } from "react";
import { GraduationCap } from "lucide-react";
import { auth } from "../../../initializeFirebase"; 
import styles from "./createClassModal.module.css";

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // To refresh parent page
}

export default function CreateClassModal({ isOpen, onClose, onSuccess }: CreateClassModalProps) {
  const [className, setClassName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!className.trim()) return;

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not logged in");
      const idToken = await user.getIdToken();

      // POST to create class
      const response = await fetch('http://localhost:5261/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ ClassName: className })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to create class");
      }

      const newClass = await response.json();
      // Show success state with code
      setGeneratedCode(newClass.classCode);

    } catch (error: any) {
      console.error("Error creating class:", error);
      alert(error.message);
      setIsLoading(false); // Only stop loading on error so we can transition to success
    }
  };

  const handleClose = () => {
    // Reset state when closing
    setClassName("");
    setGeneratedCode(null);
    setIsLoading(false);
    onClose();
  };

  const handleDone = () => {
    onSuccess(); // Refresh the dashboard data
    handleClose();
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        {!generatedCode ? (
          // 1. CREATE FORM
          <>
            <div className={styles.header}>
              <div className={styles.iconWrapper}>
                <GraduationCap size={28} />
              </div>
              <h2 className={styles.title}>Create New Class</h2>
            </div>

            <form onSubmit={handleCreateClass}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Class Name</label>
                <input
                  className={styles.input}
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="e.g. Biology 101 - Section A"
                  autoFocus
                />
              </div>

              <div className={styles.actions}>
                <button type="button" onClick={handleClose} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading || !className.trim()} 
                  className={styles.createBtn}
                >
                  {isLoading ? "Creating..." : "Create Class"}
                </button>
              </div>
            </form>
          </>
        ) : (
          // 2. SUCCESS STATE (SHOW CODE)
          <div className={styles.successState}>
            <div className={styles.header} style={{justifyContent:'center', marginBottom: '5px'}}>
               <div className={styles.iconWrapper}>
                <GraduationCap size={28} />
              </div>
            </div>
            <h2 className={styles.title} style={{color:'#166534'}}>Class Created!</h2>
            <p style={{color:'#666', marginTop: '10px'}}>Share this code with your students:</p>
            
            <div className={styles.codeBox}>
              {generatedCode}
            </div>

            <button onClick={handleDone} className={styles.doneBtn}>
              Done
            </button>
          </div>
        )}

      </div>
    </div>
  );
}