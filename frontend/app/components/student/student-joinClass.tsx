"use client";

import { useState } from "react";
import { GraduationCap, ArrowRight } from "lucide-react";
import { auth } from "../../../initializeFirebase"; 
import styles from "./student-joinClass.module.css";

interface JoinClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // To refresh parent page
}

export default function JoinClassModal({ isOpen, onClose, onSuccess }: JoinClassModalProps) {
  const [joinCode, setJoinCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!joinCode.trim()) return;

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not logged in");
      const idToken = await user.getIdToken();

      // POST to join class endpoint
      // Note: Make sure your backend endpoint matches this URL
      const response = await fetch('http://localhost:5261/api/classes/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        // Sending the code as JSON. Ensure your backend expects "code" or "classCode"
        body: JSON.stringify({ code: joinCode }) 
      });

      if (!response.ok) {
        // Try to read error message from backend, fallback to text
        let errorMessage = "Failed to join class";
        try {
            const err = await response.json();
            errorMessage = err.message || errorMessage;
        } catch {
            errorMessage = await response.text();
        }
        throw new Error(errorMessage);
      }

      // If successful
      setIsSuccess(true);

    } catch (error: any) {
      console.error("Error joining class:", error);
      alert(error.message);
      setIsLoading(false); 
    }
  };

  const handleClose = () => {
    // Reset state when closing
    setJoinCode("");
    setIsSuccess(false);
    setIsLoading(false);
    onClose();
  };

  const handleDone = () => {
    onSuccess(); // Refresh the dashboard data
    handleClose();
  };

  console.log("Debug Styles:", styles);

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        {!isSuccess ? (
          // 1. JOIN FORM
          <>
            <div className={styles.header}>
              <div className={styles.iconWrapper}>
                <GraduationCap size={28} />
              </div>
              <h2 className={styles.title}>Join a Class</h2>
            </div>

            <form onSubmit={handleJoinClass}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Class Code</label>
                <input
                  className={styles.input}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())} // Auto-uppercase for codes
                  placeholder="e.g. X7Y2Z9"
                  autoFocus
                />
              </div>

              <div className={styles.actions}>
                <button type="button" onClick={handleClose} className={styles.cancelBtn}>
                  Cancel
                </button>
                
                <button 
                  type="submit" 
                  disabled={isLoading || !joinCode.trim()} 
                  className={styles.joinBtn}
                >
                  {isLoading ? "Joining..." : "Join Class"}
                </button>
              </div>
            </form>
          </>
        ) : (
          // 2. SUCCESS STATE
          <div className={styles.successState}>
            <div className={styles.header} style={{justifyContent:'center', marginBottom: '5px'}}>
               <div className={styles.iconWrapper} style={{backgroundColor: '#dcfce7', color: '#166534'}}>
                <GraduationCap size={28} />
              </div>
            </div>
            <h2 className={styles.title} style={{color:'#166534'}}>Success!</h2>
            <p style={{color:'#666', marginTop: '10px'}}>You have successfully joined the class.</p>
            
            <button onClick={handleDone} className={styles.doneBtn} style={{marginTop: '20px'}}>
              Go to Dashboard <ArrowRight size={16} style={{marginLeft:'5px'}}/>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}